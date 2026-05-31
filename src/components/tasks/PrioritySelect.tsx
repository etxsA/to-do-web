import type { Priority } from '@/types/api'
import { PRIORITIES } from '@/types/api'
import { PRIORITY_META } from '@/utils/format'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PrioritySelect({
  value,
  onChange,
}: {
  value?: Priority
  onChange: (p: Priority) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Priority)}>
      <SelectTrigger className="w-full" data-testid="select-priority">
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        {PRIORITIES.map((p) => (
          <SelectItem key={p} value={p}>
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: PRIORITY_META[p].color }}
            />
            {PRIORITY_META[p].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
