import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import type { Task } from '@/types/api'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useDeleteTask, useToggleTaskGlobal } from '@/hooks/useTaskMutations'
import { SMART_LISTS, filterSmart, type SmartListType } from '@/utils/smartLists'
import { sortTasks } from '@/utils/taskSort'
import { isApiError } from '@/utils/errors'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { TaskRow } from '@/components/tasks/TaskRow'
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog'

const VALID: SmartListType[] = ['today', 'overdue', 'high', 'all']

export function SmartList() {
  const { type } = useParams()
  const smart = type as SmartListType
  const { tasks, isPending, isError, error, refetch } = useAllTasks()
  const toggle = useToggleTaskGlobal()
  const del = useDeleteTask()

  const [editTask, setEditTask] = useState<Task | undefined>()
  const [deleteTask, setDeleteTask] = useState<Task | undefined>()

  const filtered = useMemo(
    () => (VALID.includes(smart) ? sortTasks(filterSmart(tasks, smart), 'due') : []),
    [tasks, smart],
  )

  if (!VALID.includes(smart)) return <Navigate to="/" replace />

  const def = SMART_LISTS[smart]

  const onDelete = async () => {
    if (!deleteTask) return
    try {
      await del.mutateAsync(deleteTask.id)
      toast.success('Task deleted')
      setDeleteTask(undefined)
    } catch (err) {
      toast.error(isApiError(err) ? err.message : 'Could not delete the task')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
          {def.title}
        </h1>
        <p className="mt-1 text-muted-foreground">{def.subtitle}</p>
      </div>

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing here" description={`No tasks match "${def.title}".`} />
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              disabled={toggle.isPending}
              onToggle={() => toggle.mutate({ id: task.id, completed: !task.completed })}
              onEdit={() => setEditTask(task)}
              onDelete={() => setDeleteTask(task)}
            />
          ))}
        </div>
      )}

      <EditTaskDialog
        task={editTask}
        open={Boolean(editTask)}
        onOpenChange={(o) => !o && setEditTask(undefined)}
      />
      <ConfirmDialog
        open={Boolean(deleteTask)}
        onOpenChange={(o) => !o && setDeleteTask(undefined)}
        title="Delete this task?"
        description={`"${deleteTask?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        loading={del.isPending}
        onConfirm={onDelete}
      />
    </div>
  )
}
