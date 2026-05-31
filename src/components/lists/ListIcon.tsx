import type { Icon } from '@/types/api'
import { iconComponent } from '@/lib/icons'
import { cn } from '@/lib/utils'

/** Colored rounded tile with the list's icon — tile bg is a 12% tint of the
 *  list color, the glyph uses the full color (matches Figma list cards). */
export function ListIcon({
  icon,
  color,
  className,
  size = 'md',
}: {
  icon?: Icon
  color: string
  className?: string
  size?: 'sm' | 'md'
}) {
  const Glyph = iconComponent(icon)
  const box = size === 'sm' ? 'size-8 rounded-lg' : 'size-10 rounded-lg'
  const glyph = size === 'sm' ? 'size-4' : 'size-5'
  return (
    <div
      className={cn('flex items-center justify-center', box, className)}
      style={{ backgroundColor: `${color}1F` }}
    >
      <Glyph className={glyph} style={{ color }} />
    </div>
  )
}
