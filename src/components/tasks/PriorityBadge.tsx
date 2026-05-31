import type { Priority } from '@/types/api'
import { PRIORITY_META } from '@/utils/format'

/** Small uppercase priority pill using the shared priority palette. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority]
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {meta.label} Priority
    </span>
  )
}
