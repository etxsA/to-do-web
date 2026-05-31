import { AlertCircle } from 'lucide-react'
import { isApiError } from '@/utils/errors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error?: unknown
  onRetry?: () => void
  className?: string
}) {
  const message = isApiError(error)
    ? error.message
    : 'Something went wrong. Please try again.'

  return (
    <div
      className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center', className)}
      role="alert"
    >
      <AlertCircle className="size-7 text-destructive" />
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} data-testid="btn-retry">
          Try again
        </Button>
      )}
    </div>
  )
}
