import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { UserMenu } from '@/components/layout/UserMenu'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/about', label: 'About', end: false },
]

export function TopNav() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-6">
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight text-primary">
          Scholarly Atelier
        </Link>

        <nav className="flex items-center gap-8">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'border-b-2 border-transparent py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'border-primary font-semibold text-primary',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <form onSubmit={onSearch} className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              aria-label="Search"
              data-testid="input-topnav-search"
              className="h-9 w-56 bg-muted pl-9"
            />
          </form>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
