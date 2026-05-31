import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarCheck, Flag, ListTodo, type LucideIcon } from 'lucide-react'

import { SMART_LIST_ORDER, SMART_LISTS, type SmartListType } from '@/utils/smartLists'

const ICONS: Record<SmartListType, LucideIcon> = {
  today: CalendarCheck,
  overdue: AlertTriangle,
  high: Flag,
  all: ListTodo,
}

/** Quick links to the client-side smart lists (Today / Overdue / High / All). */
export function SmartCardsRow() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {SMART_LIST_ORDER.map((type) => {
        const def = SMART_LISTS[type]
        const Icon = ICONS[type]
        return (
          <Link
            key={type}
            to={`/smart/${type}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
          >
            <div
              className="flex size-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${def.color}1F` }}
            >
              <Icon className="size-4" style={{ color: def.color }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{def.title}</p>
              <p className="truncate text-xs text-muted-foreground">{def.subtitle}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
