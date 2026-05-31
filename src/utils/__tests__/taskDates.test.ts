import { dueDateToInput, inputToDueDate } from '@/utils/taskDates'

describe('taskDates', () => {
  test('dueDateToInput takes the date part', () => {
    expect(dueDateToInput('2026-06-01T09:00:00')).toBe('2026-06-01')
    expect(dueDateToInput(undefined)).toBe('')
  })

  test('inputToDueDate anchors at noon, or undefined when empty', () => {
    expect(inputToDueDate('2026-06-01')).toBe('2026-06-01T12:00:00')
    expect(inputToDueDate('')).toBeUndefined()
    expect(inputToDueDate(undefined)).toBeUndefined()
  })
})
