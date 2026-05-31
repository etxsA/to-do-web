import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { Task } from '@/types/api'
import { deleteTask } from '@/services/task.service'
import { isApiError } from '@/utils/errors'
import { taskKeys, taskListKeys } from '@/utils/queryKeys'

/**
 * Delete one or more tasks with a 5s "Undo" window. The tasks vanish from the
 * list's cache immediately; the real DELETE only fires when the toast expires.
 * Clicking Undo restores the cache and cancels the request. (Backend has no
 * soft-delete, so undo is a client-side buffer — API.md §12.)
 */
export function useUndoableTaskDelete(listId: number) {
  const qc = useQueryClient()
  const key = taskKeys.byList(listId)

  return (tasksToDelete: Task[]) => {
    if (tasksToDelete.length === 0) return
    const ids = new Set(tasksToDelete.map((t) => t.id))
    const prev = qc.getQueryData<Task[]>(key)
    qc.setQueryData<Task[]>(key, (old) => old?.filter((t) => !ids.has(t.id)))

    let committed = false
    const timer = setTimeout(async () => {
      committed = true
      try {
        await Promise.all(tasksToDelete.map((t) => deleteTask(t.id)))
      } catch (err) {
        toast.error(isApiError(err) ? err.message : 'Could not delete the task(s)')
        qc.setQueryData(key, prev) // restore on failure
      } finally {
        qc.invalidateQueries({ queryKey: taskKeys.all })
        qc.invalidateQueries({ queryKey: taskListKeys.all })
      }
    }, 5000)

    toast(`${ids.size} task${ids.size > 1 ? 's' : ''} deleted`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          if (committed) return
          clearTimeout(timer)
          qc.setQueryData(key, prev)
        },
      },
    })
  }
}
