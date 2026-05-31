import { Link, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * Authed app shell. Bootstrap version: a static sidebar + content outlet.
 * The real shell (avatar, theme toggle, active states, mobile drawer) lands in
 * `feature/shell`; protection wrapping lands in `feature/auth`.
 */
const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/search', label: 'Search' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/board', label: 'Board' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/profile', label: 'Profile' },
]

export function RootLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar p-4 md:block">
        <div className="mb-6 px-2 text-lg font-bold text-primary">EduTask</div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                pathname === item.to && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
