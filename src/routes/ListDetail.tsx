import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import type { Task } from '@/types/api'
import { useTaskList } from '@/hooks/useTaskLists'
import { useTasksByList } from '@/hooks/useTasks'
import { useDeleteTask, useToggleTaskCompleted } from '@/hooks/useTaskMutations'
import { sortTasks } from '@/utils/taskSort'
import { isApiError } from '@/utils/errors'
import { cn } from '@/lib/utils'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { TaskRow } from '@/components/tasks/TaskRow'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog'

export function ListDetail() {
  const { id } = useParams()
  const listId = Number(id)

  const listQ = useTaskList(listId)
  const tasksQ = useTasksByList(listId)
  const toggle = useToggleTaskCompleted(listId)
  const del = useDeleteTask()

  const [showCompleted, setShowCompleted] = useState(true)
  const [editTask, setEditTask] = useState<Task | undefined>()
  const [deleteTask, setDeleteTask] = useState<Task | undefined>()

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
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setShowCompleted(true)}
              className={cn(
                'flex items-center gap-2 rounded px-4 py-2 text-sm font-bold transition',
                showCompleted ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
              )}
              data-testid="btn-show-completed"
            >
              <Eye className="size-4" /> Show Completed
            </button>
            <button
              type="button"
              onClick={() => setShowCompleted(false)}
              className={cn(
                'flex items-center gap-2 rounded px-4 py-2 text-sm font-bold transition',
                !showCompleted ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
              )}
              data-testid="btn-hide-completed"
            >
              <EyeOff className="size-4" /> Hide Completed
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {tasksQ.isPending ? (
        <LoadingState />
      ) : tasksQ.isError ? (
        <ErrorState error={tasksQ.error} onRetry={() => tasksQ.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Add your first task using the form below."
        />
      ) : (
        <div className="space-y-4">
          {visible.map((task) => (
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

      {/* Create */}
      <div className="border-t border-border pt-8">
        <CreateTaskForm listId={listId} />
      </div>

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
