import { Link } from 'react-router-dom'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

import type { TaskListWithOldestPending } from '@/types/api'
import { ListIcon } from '@/components/lists/ListIcon'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function TaskListCard({
  list,
  taskCount,
  onEdit,
  onDelete,
}: {
  list: TaskListWithOldestPending
  taskCount?: number
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <ListIcon icon={list.icon} color={list.color} />
        <div className="flex items-center gap-1">
          {typeof taskCount === 'number' && (
            <span className="text-sm font-bold" style={{ color: list.color }}>
              {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="List actions"
                onClick={(e) => e.preventDefault()}
                data-testid="btn-list-menu"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} variant="destructive">
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Link to={`/lists/${list.id}`} className="block">
        <h3 className="font-display text-base font-bold text-foreground">{list.name}</h3>
        {list.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{list.description}</p>
        )}
        <Progress
          value={list.progress}
          className="mt-4 h-1.5"
          indicatorColor={list.color}
        />
        <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {list.progress}% Completed
        </p>
      </Link>
    </div>
  )
}
