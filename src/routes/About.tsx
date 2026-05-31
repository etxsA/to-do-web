import { useNavigate } from 'react-router-dom'
import { BookOpen, BarChart3, CheckCircle2, Heart, LogOut, Mail } from 'lucide-react'

import { useAuthStore } from '@/stores/authStore'
import { useAllTasks } from '@/hooks/useAllTasks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const TECH = ['React 19', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query', 'Vite']

function initials(name?: string) {
  if (!name) return 'U'
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

export function About() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { tasks } = useAllTasks()

  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const rate = total ? Math.round((completed / total) * 100) : 0

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <header className="mx-auto max-w-3xl pt-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          About the Atelier
        </p>
        <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-foreground">
          Crafting Knowledge with Code.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          A sanctuary for deep work and structured learning, designed for the modern academic
          developer.
        </p>
      </header>

      {/* Content */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* About the project */}
        <article className="rounded-2xl bg-card p-10 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="size-5 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">About the Project</h2>
          </div>

          <p className="text-lg leading-relaxed text-ink-muted">
            Scholarly Atelier is more than just a task manager; it is an educational endeavor built
            to explore the boundaries of modern frontend development.
          </p>

          <blockquote className="my-6 rounded-lg border-l-4 border-primary bg-secondary/40 p-6 text-foreground">
            "An educational todo application designed as a practical playground for mastering React's
            component-based architecture and state management."
          </blockquote>

          <p className="leading-relaxed text-ink-muted">
            By blending the focused environment of a private library with contemporary web
            technologies, this project demonstrates how aesthetic design and functional logic can
            coexist harmoniously. It consumes the same backend and Firebase project as the mobile
            app, reusing its types, services, and hooks.
          </p>

          <div className="mt-12 flex flex-wrap gap-3">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </article>

        {/* Profile + stats */}
        <aside className="space-y-8">
          <div className="flex flex-col items-center rounded-2xl bg-secondary/40 p-8 text-center">
            <Avatar className="size-24">
              <AvatarImage src={user?.firebaseImage} alt={user?.fullName} />
              <AvatarFallback className="bg-card text-2xl font-bold text-primary">
                {initials(user?.fullName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
              {user?.fullName ?? 'Scholar'}
            </h2>
            <p className="mt-1 text-sm font-medium text-primary">{user?.role ?? 'Member'}</p>
            {user?.email && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" /> {user.email}
              </p>
            )}
            <Button variant="outline" className="mt-6 w-full" onClick={onLogout} data-testid="btn-logout-about">
              <LogOut className="size-4" /> Log out
            </Button>
          </div>

          <div className="rounded-2xl bg-card p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Quick Stats
            </h3>
            <ul className="mt-6 space-y-6">
              <StatItem icon={BarChart3} label="Completion Rate" value={`${rate}% (${completed}/${total})`} />
              {user?.interest && <StatItem icon={Heart} label="Interest" value={user.interest} />}
              <StatItem
                icon={CheckCircle2}
                label="About"
                value={user?.description ?? 'No description provided.'}
              />
            </ul>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-border pt-8">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="font-display font-bold text-foreground">Scholarly Atelier</p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Scholarly Atelier. Built for the modern academic.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3
  label: string
  value: string
}) {
  return (
    <li className="flex items-start gap-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-foreground">{value}</p>
      </div>
    </li>
  )
}
