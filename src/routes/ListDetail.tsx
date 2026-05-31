import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Eye, EyeOff, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import type { Task } from '@/types/api'
import { useTaskList } from '@/hooks/useTaskLists'
import { useTasksByList } from '@/hooks/useTasks'
import { useToggleTaskCompleted } from '@/hooks/useTaskMutations'
import { useUndoableTaskDelete } from '@/hooks/useUndoableTaskDelete'
import { setTaskCompleted } from '@/services/task.service'
import { sortTasks } from '@/utils/taskSort'
import { isApiError } from '@/utils/errors'
import { taskKeys, taskListKeys } from '@/utils/queryKeys'
import { cn } from '@/lib/utils'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskRow } from '@/components/tasks/TaskRow'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog'

export function ListDetail() {
  const { id } = useParams()
  const listId = Number(id)
  const qc = useQueryClient()

  const listQ = useTaskList(listId)
  const tasksQ = useTasksByList(listId)
  const toggle = useToggleTaskCompleted(listId)
  const undoDelete = useUndoableTaskDelete(listId)

  const [showCompleted, setShowCompleted] = useState(true)
  const [editTask, setEditTask] = useState<Task | undefined>()
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const bulkComplete = useMutation({
    mutationFn: (tasks: Task[]) => Promise.all(tasks.map((t) => setTaskCompleted(t.id, true))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: taskListKeys.all })
      toast.success('Tasks completed')
      clearSelection()
    },
    onError: (err) => toast.error(isApiError(err) ? err.message : 'Could not complete the tasks'),
  })

  const { pending, completed } = useMemo(() => {
    const all = tasksQ.data ?? []
    return {
      pending: sortTasks(all.filter((t) => !t.completed), 'due'),
      completed: all.filter((t) => t.completed),
    }
  }, [tasksQ.data])

  if (listQ.isPending) return <LoadingState />
  if (listQ.isError) return <ErrorState error={listQ.error} onRetry={() => listQ.refetch()} />

  const list = listQ.data
  const visible = showCompleted ? [...pending, ...completed] : pending
  const selectedTasks = visible.filter((t) => selected.has(t.id))

  function clearSelection() {
    setSelected(new Set())
    setSelectMode(false)
  }
  const toggleSelected = (taskId: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(taskId) ? next.delete(taskId) : next.add(taskId)
      return next
    })

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          {list?.name}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
              {list?.name}
            </h1>
            {list?.description && <p className="mt-1 text-muted-foreground">{list.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={selectMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => (selectMode ? clearSelection() : setSelectMode(true))}
              data-testid="btn-select-mode"
            >
              <CheckSquare className="size-4" /> {selectMode ? 'Done' : 'Select'}
            </Button>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setShowCompleted(true)}
                className={cn(
                  'flex items-center gap-2 rounded px-3 py-1.5 text-sm font-bold transition',
                  showCompleted ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
                )}
                data-testid="btn-show-completed"
              >
                <Eye className="size-4" /> Show
              </button>
              <button
                type="button"
                onClick={() => setShowCompleted(false)}
                className={cn(
                  'flex items-center gap-2 rounded px-3 py-1.5 text-sm font-bold transition',
                  !showCompleted ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
                )}
                data-testid="btn-hide-completed"
              >
                <EyeOff className="size-4" /> Hide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk toolbar */}
      {selectMode && selected.size > 0 && (
        <div className="sticky top-20 z-10 flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkComplete.mutate(selectedTasks)}
              disabled={bulkComplete.isPending}
              data-testid="btn-bulk-complete"
            >
              <CheckSquare className="size-4" /> Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => {
                undoDelete(selectedTasks)
                clearSelection()
              }}
              data-testid="btn-bulk-delete"
            >
              <Trash2 className="size-4" /> Delete
            </Button>
            <Button size="icon" variant="ghost" className="size-8" onClick={clearSelection} aria-label="Clear selection">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tasks */}
      {tasksQ.isPending ? (
        <LoadingState />
      ) : tasksQ.isError ? (
        <ErrorState error={tasksQ.error} onRetry={() => tasksQ.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState title="No tasks yet" description="Add your first task using the form below." />
      ) : (
        <div className="space-y-4">
          {visible.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              {selectMode && (
                <Checkbox
                  className="mt-6"
                  checked={selected.has(task.id)}
                  onCheckedChange={() => toggleSelected(task.id)}
                  aria-label={`Select ${task.title}`}
                  data-testid="checkbox-select-task"
                />
              )}
              <div className="flex-1">
                <TaskRow
                  task={task}
                  disabled={toggle.isPending}
                  onToggle={() => toggle.mutate({ id: task.id, completed: !task.completed })}
                  onEdit={() => setEditTask(task)}
                  onDelete={() => undoDelete([task])}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create */}
      <div className="border-t border-border pt-8">
        <CreateTaskForm listId={listId} />
      </div>

      <EditTaskDialog
        task={editTask}
        open={Boolean(editTask)}
        onOpenChange={(o) => !o && setEditTask(undefined)}
      />
    </div>
  )
}
