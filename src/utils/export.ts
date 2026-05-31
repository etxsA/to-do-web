import type { Task } from '@/types/api'

/** Trigger a client-side file download (no backend involved). */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value: string | number | boolean): string {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function tasksToCsv(tasks: Task[]): string {
  const header = ['id', 'title', 'description', 'priority', 'dueDate', 'completed']
  const rows = tasks.map((t) =>
    [t.id, t.title, t.description ?? '', t.priority, t.dueDate ?? '', t.completed]
      .map(csvCell)
      .join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

export function tasksToJson(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2)
}

/** Minimal RFC-5545 calendar: one VEVENT per task that has a due date. */
export function tasksToIcs(tasks: Task[]): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return (
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
      `T${pad(d.getHours())}${pad(d.getMinutes())}00`
    )
  }
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Scholarly Atelier//Tasks//EN',
  ]
  for (const t of tasks) {
    if (!t.dueDate) continue
    lines.push(
      'BEGIN:VEVENT',
      `UID:task-${t.id}@scholarly-atelier`,
      `DTSTART:${fmt(t.dueDate)}`,
      `SUMMARY:${esc(t.title)}`,
      `DESCRIPTION:${esc(`${t.description ?? ''} [${t.priority}]`)}`,
      `STATUS:${t.completed ? 'COMPLETED' : 'NEEDS-ACTION'}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export type ExportFormat = 'csv' | 'json' | 'ics'

export function exportTasks(tasks: Task[], format: ExportFormat): void {
  const stamp = new Date().toISOString().slice(0, 10)
  if (format === 'csv') downloadFile(`tasks-${stamp}.csv`, tasksToCsv(tasks), 'text/csv')
  else if (format === 'json')
    downloadFile(`tasks-${stamp}.json`, tasksToJson(tasks), 'application/json')
  else downloadFile(`tasks-${stamp}.ics`, tasksToIcs(tasks), 'text/calendar')
}
