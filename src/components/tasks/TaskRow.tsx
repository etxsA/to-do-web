import { Calendar, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react'

import type { Task } from '@/types/api'
import { formatDueDate, isOverdue } from '@/utils/format'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  disabled,
}: {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}) {
  const done = task.completed
  return (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-xl border p-5 transition',
        done ? 'border-success/15 bg-success/5' : 'border-border bg-card hover:shadow-sm',
      )}
      data-testid="task-row"
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
        aria-pressed={done}
        className="mt-0.5 shrink-0 disabled:opacity-50"
        data-testid="btn-toggle-task"
      >
        {done ? (
          <CheckCircle2 className="size-5 text-success" />
        ) : (
          <Circle className="size-5 text-muted-foreground transition-colors hover:text-primary" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'font-display text-base font-bold',
              done ? 'text-muted-foreground line-through' : 'text-foreground',
            )}
          >
            {task.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!done && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={onEdit}
                aria-label="Edit task"
                data-testid="btn-edit-task"
              >
                <Pencil className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={onDelete}
              aria-label="Delete task"
              data-testid="btn-delete-task"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {task.description && (
          <p className={cn('mt-1 text-sm', done ? 'text-muted-foreground' : 'text-ink-muted')}>
            {task.description}
          </p>
        )}

        {!done && (task.dueDate || task.priority) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {task.dueDate && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold',
                  isOverdue(task.dueDate) ? 'text-destructive' : 'text-primary',
                )}
              >
                <Calendar className="size-3.5" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
            <PriorityBadge priority={task.priority} />
          </div>
        )}
      </div>
    </div>
  )
}
