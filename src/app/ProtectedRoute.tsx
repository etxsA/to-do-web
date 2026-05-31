import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

/**
 * Route guard driven by the auth store.
 *  - `init`   → still restoring the Firebase session: show a spinner.
 *  - `guest`  → redirect to /login.
 *  - `authed` → render the nested routes.
 */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)

  if (status === 'init') {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
