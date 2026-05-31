import { Outlet } from 'react-router-dom'
import { TopNav } from '@/components/layout/TopNav'

/** Authed app shell: sticky top nav + centered content area (max 1280px). */
export function RootLayout() {
  return (
    <div className="min-h-svh bg-background">
      <TopNav />
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
