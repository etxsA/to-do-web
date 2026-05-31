import type { Task } from '@/types/api'
import { tasksToCsv, tasksToIcs, tasksToJson } from '@/utils/export'

const make = (over: Partial<Task>): Task => ({
  id: 1,
  title: 't',
  priority: 'MEDIUM',
  completed: false,
  taskListIds: [],
  ...over,
})

describe('export', () => {
  test('CSV has a header and escapes commas/quotes', () => {
    const csv = tasksToCsv([make({ id: 7, title: 'a, "b"', priority: 'HIGH' })])
    const [header, row] = csv.split('\n')
    expect(header).toBe('id,title,description,priority,dueDate,completed')
    expect(row).toContain('"a, ""b"""')
    expect(row).toContain('HIGH')
  })

  test('JSON round-trips the tasks', () => {
    const tasks = [make({ id: 1 }), make({ id: 2 })]
    expect(JSON.parse(tasksToJson(tasks))).toHaveLength(2)
  })

  test('ICS emits one VEVENT per task with a due date', () => {
    const ics = tasksToIcs([
      make({ id: 1, dueDate: '2026-06-01T09:00:00' }),
      make({ id: 2 }), // no due date → skipped
    ])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
    expect(ics).toContain('DTSTART:20260601T090000')
  })
})
