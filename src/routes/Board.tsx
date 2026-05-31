import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'

import type { Priority, Task } from '@/types/api'
import { useAllTasks } from '@/hooks/useAllTasks'
import { updateTask } from '@/services/task.service'
import { PRIORITY_META } from '@/utils/format'
import { isApiError } from '@/utils/errors'
import { taskKeys, taskListKeys } from '@/utils/queryKeys'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { cn } from '@/lib/utils'

const COLUMNS: Priority[] = ['HIGH', 'MEDIUM', 'LOW']
const ORDER_KEY = 'board-order'

type OrderMap = Record<Priority, number[]>

function loadOrder(): OrderMap {
  try {
    return { HIGH: [], MEDIUM: [], LOW: [], ...JSON.parse(localStorage.getItem(ORDER_KEY) ?? '{}') }
  } catch {
    return { HIGH: [], MEDIUM: [], LOW: [] }
  }
}

/** Order a column's tasks by the saved id order, appending any new ones. */
function ordered(tasks: Task[], order: number[]): Task[] {
  const rank = new Map(order.map((id, i) => [id, i]))
  return [...tasks].sort(
    (a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9) || a.id - b.id,
  )
}

export function Board() {
  const { tasks, isPending, isError, error, refetch } = useAllTasks()
  const qc = useQueryClient()
  const [order, setOrder] = useState<OrderMap>(loadOrder)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order))
  }, [order])

  const setPriority = useMutation({
    mutationFn: ({ task, priority }: { task: Task; priority: Priority }) =>
      updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority,
        dueDate: task.dueDate,
        taskListIds: task.taskListIds,
        isCompleted: task.completed,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: taskListKeys.all })
    },
    onError: (err) => toast.error(isApiError(err) ? err.message : 'Could not move the task'),
  })

  const columns = useMemo(() => {
    const map = {} as Record<Priority, Task[]>
    for (const p of COLUMNS) map[p] = ordered(tasks.filter((t) => t.priority === p), order[p])
    return map
  }, [tasks, order])

  if (isPending) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const taskId = Number(active.id)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Target column = the over item's column (a task) or the column droppable id.
    const overId = String(over.id)
    const overTask = tasks.find((t) => t.id === Number(overId))
    const targetCol = (overTask?.priority ?? (COLUMNS.includes(overId as Priority) ? (overId as Priority) : task.priority))

    if (targetCol !== task.priority) {
      setPriority.mutate({ task, priority: targetCol })
      return
    }
    // Reorder within the same column.
    if (overTask && overTask.id !== task.id) {
      setOrder((prev) => {
        const ids = columns[task.priority].map((t) => t.id)
        const from = ids.indexOf(task.id)
        const to = ids.indexOf(overTask.id)
        ids.splice(to, 0, ids.splice(from, 1)[0])
        return { ...prev, [task.priority]: ids }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Board</h1>
        <p className="mt-1 text-muted-foreground">
          Drag tasks between priority columns. Order is saved on this device.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((p) => (
            <Column key={p} priority={p} tasks={columns[p]} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function Column({ priority, tasks }: { priority: Priority; tasks: Task[] }) {
  const meta = PRIORITY_META[priority]
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-sm font-bold uppercase tracking-wide" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-24 space-y-2">
          {tasks.map((t) => (
            <Card key={t.id} task={t} />
          ))}
          {tasks.length === 0 && (
            <p className="px-1 py-4 text-center text-xs text-muted-foreground">Drop here</p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function Card({ task }: { task: Task }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-xl border border-border bg-card p-3 shadow-sm',
        isDragging && 'opacity-50',
      )}
      data-testid="board-card"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label="Drag handle"
        >
          ⋮⋮
        </button>
        <button onClick={() => navigate(`/lists/${task.taskListIds[0] ?? ''}`)} className="min-w-0 flex-1 text-left">
          <p className={cn('truncate text-sm font-semibold', task.completed && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {task.description && (
            <p className="truncate text-xs text-muted-foreground">{task.description}</p>
          )}
        </button>
      </div>
    </div>
  )
}
