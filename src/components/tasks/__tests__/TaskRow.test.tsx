import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import type { Task } from '@/types/api'
import { TaskRow } from '@/components/tasks/TaskRow'

const task: Task = {
  id: 1,
  title: 'Write thesis',
  description: 'Chapter 4',
  priority: 'HIGH',
  completed: false,
  dueDate: '2026-06-01T12:00:00',
  taskListIds: [1],
}

function setup(over: Partial<Parameters<typeof TaskRow>[0]> = {}) {
  const onToggle = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(<TaskRow task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} {...over} />)
  return { onToggle, onEdit, onDelete }
}

describe('TaskRow', () => {
  test('renders title, description and priority', () => {
    setup()
    expect(screen.getByText('Write thesis')).toBeInTheDocument()
    expect(screen.getByText('Chapter 4')).toBeInTheDocument()
    expect(screen.getByText(/high priority/i)).toBeInTheDocument()
  })

  test('toggling calls onToggle', async () => {
    const { onToggle } = setup()
    await userEvent.click(screen.getByTestId('btn-toggle-task'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  test('completed task is struck through and hides edit', () => {
    setup({ task: { ...task, completed: true } })
    const title = screen.getByText('Write thesis')
    expect(title.className).toMatch(/line-through/)
    expect(screen.queryByTestId('btn-edit-task')).not.toBeInTheDocument()
  })
})
