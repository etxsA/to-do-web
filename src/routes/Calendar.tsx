import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Task } from '@/types/api'
import { useAllTasks } from '@/hooks/useAllTasks'
import { PRIORITY_META } from '@/utils/format'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Calendar() {
  const navigate = useNavigate()
  const { tasks, isPending, isError, error, refetch } = useAllTasks()
  const [cursor, setCursor] = useState(() => new Date())

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      if (!t.dueDate) continue
      const key = t.dueDate.slice(0, 10)
      const arr = map.get(key) ?? []
      arr.push(t)
      map.set(key, arr)
    }
    return map
  }, [tasks])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    return eachDayOfInterval({ start, end })
  }, [cursor])

  if (isPending) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            Calendar
          </h1>
          <p className="mt-1 text-muted-foreground">Tasks by due date.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => subMonths(c, 1))} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-40 text-center font-display font-bold">{format(cursor, 'MMMM yyyy')}</span>
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((d) => (
            <div key={d} className="p-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayTasks = byDay.get(key) ?? []
            return (
              <div
                key={key}
                className={cn(
                  'min-h-24 border-b border-r border-border p-1.5 last:border-r-0',
                  !isSameMonth(day, cursor) && 'bg-muted/30',
                )}
              >
                <div
                  className={cn(
                    'mb-1 flex size-6 items-center justify-center rounded-full text-xs',
                    isToday(day) ? 'bg-primary font-bold text-primary-foreground' : 'text-muted-foreground',
                    isSameDay(day, cursor) && !isToday(day) && 'font-bold text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/lists/${t.taskListIds[0] ?? ''}`)}
                      className={cn(
                        'block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium',
                        t.completed && 'line-through opacity-60',
                      )}
                      style={{
                        backgroundColor: PRIORITY_META[t.priority].bg,
                        color: PRIORITY_META[t.priority].color,
                      }}
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="px-1 text-[10px] text-muted-foreground">+{dayTasks.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
