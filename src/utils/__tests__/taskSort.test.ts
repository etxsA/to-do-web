import type { Task } from '@/types/api';
import { filterByStatus, sortTasks } from '@/utils/taskSort';

const make = (over: Partial<Task>): Task => ({
  id: 1,
  title: 't',
  priority: 'MEDIUM',
  completed: false,
  taskListIds: [],
  ...over,
});

describe('taskSort', () => {
  test('sorts by priority HIGH < MEDIUM < LOW', () => {
    const tasks = [
      make({ id: 1, priority: 'LOW' }),
      make({ id: 2, priority: 'HIGH' }),
      make({ id: 3, priority: 'MEDIUM' }),
    ];
    expect(sortTasks(tasks, 'priority').map((t) => t.id)).toEqual([2, 3, 1]);
  });

  test('sorts by due date ascending, nulls last', () => {
    const tasks = [
      make({ id: 1, dueDate: undefined }),
      make({ id: 2, dueDate: '2026-06-02T10:00:00' }),
      make({ id: 3, dueDate: '2026-06-01T10:00:00' }),
    ];
    expect(sortTasks(tasks, 'due').map((t) => t.id)).toEqual([3, 2, 1]);
  });

  test('sorts by title alphabetically', () => {
    const tasks = [make({ id: 1, title: 'b' }), make({ id: 2, title: 'a' })];
    expect(sortTasks(tasks, 'title').map((t) => t.id)).toEqual([2, 1]);
  });

  test('filterByStatus splits pending/completed', () => {
    const tasks = [make({ id: 1, completed: true }), make({ id: 2, completed: false })];
    expect(filterByStatus(tasks, 'pending').map((t) => t.id)).toEqual([2]);
    expect(filterByStatus(tasks, 'completed').map((t) => t.id)).toEqual([1]);
    expect(filterByStatus(tasks, 'all')).toHaveLength(2);
  });
});
