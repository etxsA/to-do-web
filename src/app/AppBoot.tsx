import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'

/**
 * App-root side effects: wire the http auth bridge + subscribe to Firebase auth
 * state (returns an unsubscribe). Runs exactly once. Theme is applied by the
 * themeStore's rehydrate hook (imported here to ensure it initializes early).
 */
export function AppBoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().bootstrap()
    return unsubscribe
  }, [])

  return <>{children}</>
}
