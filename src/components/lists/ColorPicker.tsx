import { Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Theme-color swatches (Figma) + a custom color input. */
const PRESETS = ['#005BBF', '#006D2C', '#475E8C', '#BA1A1A', '#B45309']

export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  const isPreset = PRESETS.includes(value.toUpperCase())
  return (
    <div className="flex items-center gap-4">
      {PRESETS.map((c) => {
        const selected = value.toUpperCase() === c
        return (
          <button
            key={c}
            type="button"
            aria-label={`Color ${c}`}
            onClick={() => onChange(c)}
            className={cn(
              'flex size-10 items-center justify-center rounded-full transition',
              selected && 'ring-2 ring-offset-2 ring-offset-background',
            )}
            style={{ backgroundColor: c, ...(selected ? { boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${c}` } : {}) }}
          >
            {selected && <Check className="size-4 text-white" />}
          </button>
        )
      })}
      <label
        className={cn(
          'relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-muted',
          !isPreset && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        )}
        title="Custom color"
      >
        <Palette className="size-4 text-muted-foreground" />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Custom color"
        />
      </label>
    </div>
  )
}
