import type { Icon } from '@/types/api'
import { useIcons } from '@/hooks/useIcons'
import { iconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/** Grid picker over the seeded icon catalog. Backend requires a valid iconId. */
export function IconPicker({
  value,
  onChange,
  color = '#005BBF',
}: {
  value?: number
  onChange: (iconId: number) => void
  color?: string
}) {
  const { data: icons, isPending } = useIcons()

  if (isPending) {
    return (
      <div className="flex h-16 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-8 gap-2">
      {icons?.map((icon: Icon) => {
        const Glyph = iconComponent(icon)
        const selected = value === icon.id
        return (
          <button
            key={icon.id}
            type="button"
            title={icon.name}
            aria-label={icon.name}
            aria-pressed={selected}
            onClick={() => onChange(icon.id)}
            className={cn(
              'flex aspect-square items-center justify-center rounded-lg border border-border transition',
              selected ? 'border-transparent ring-2 ring-offset-1 ring-offset-background' : 'hover:bg-muted',
            )}
            style={
              selected
                ? { backgroundColor: `${color}1F`, boxShadow: `0 0 0 2px ${color}` }
                : undefined
            }
          >
            <Glyph className="size-4" style={{ color: selected ? color : undefined }} />
          </button>
        )
      })}
    </div>
  )
}
