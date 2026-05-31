import { useMemo } from 'react'
import { Download } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAllTasks } from '@/hooks/useAllTasks'
import { isOverdue } from '@/utils/format'
import { exportTasks } from '@/utils/export'
import { formatPercent } from '@/utils/percent'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Analytics() {
  const { tasks, isPending, isError, error, refetch } = useAllTasks()

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const pending = total - completed
    const overdue = tasks.filter((t) => !t.completed && isOverdue(t.dueDate)).length
    const byPriority = (['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => ({
      name: p[0] + p.slice(1).toLowerCase(),
      value: tasks.filter((t) => t.priority === p).length,
    }))
    return { total, completed, pending, overdue, byPriority }
  }, [tasks])

  if (isPending) return <LoadingState />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  const rate = stats.total ? formatPercent((stats.completed / stats.total) * 100) : '0'
  const donut = [
    { name: 'Completed', value: stats.completed, color: '#006D2C' },
    { name: 'Pending', value: stats.pending, color: '#005BBF' },
  ]
  const priorityColors = ['#BA1A1A', '#B45309', '#006D2C']

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="mt-1 text-muted-foreground">Your productivity at a glance.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="btn-export">
              <Download className="size-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportTasks(tasks, 'csv')}>CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportTasks(tasks, 'json')}>JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportTasks(tasks, 'ics')}>iCal (.ics)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Total tasks" value={stats.total} />
        <Kpi label="Completed" value={stats.completed} />
        <Kpi label="Pending" value={stats.pending} />
        <Kpi label="Overdue" value={stats.overdue} accent="#BA1A1A" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Completion</h2>
          <p className="text-sm text-muted-foreground">{rate}% of tasks done</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {donut.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-foreground">By priority</h2>
          <p className="text-sm text-muted-foreground">Task distribution</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPriority}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.byPriority.map((_, i) => (
                    <Cell key={i} fill={priorityColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}
