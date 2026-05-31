/**
 * Bootstrap-phase placeholder. Each real screen replaces its own placeholder in
 * the relevant feature phase (auth/lists/tasks/…). Kept tiny on purpose.
 */
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">Screen pending implementation.</p>
    </div>
  )
}
