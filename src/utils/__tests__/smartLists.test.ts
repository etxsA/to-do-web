import type { Task } from '@/types/api';
import { filterSmart } from '@/utils/smartLists';
import { toLocalIso } from '@/utils/format';

const make = (over: Partial<Task>): Task => ({
  id: 1,
  title: 't',
  priority: 'MEDIUM',
  completed: false,
  taskListIds: [],
  ...over,
});

describe('smart lists', () => {
  const todayIso = toLocalIso(new Date());
  const pastIso = '2000-01-01T00:00:00';

  test('today = incomplete & due today', () => {
    const tasks = [
      make({ id: 1, dueDate: todayIso }),
      make({ id: 2, dueDate: todayIso, completed: true }),
      make({ id: 3, dueDate: pastIso }),
    ];
    expect(filterSmart(tasks, 'today').map((t) => t.id)).toEqual([1]);
  });

  test('overdue = incomplete & past due (not today)', () => {
    const tasks = [make({ id: 1, dueDate: pastIso }), make({ id: 2, dueDate: todayIso })];
    expect(filterSmart(tasks, 'overdue').map((t) => t.id)).toEqual([1]);
  });

  test('high = incomplete & HIGH priority', () => {
    const tasks = [
      make({ id: 1, priority: 'HIGH' }),
      make({ id: 2, priority: 'HIGH', completed: true }),
      make({ id: 3, priority: 'LOW' }),
    ];
    expect(filterSmart(tasks, 'high').map((t) => t.id)).toEqual([1]);
  });

  test('all = everything', () => {
    const tasks = [make({ id: 1 }), make({ id: 2, completed: true })];
    expect(filterSmart(tasks, 'all')).toHaveLength(2);
  });
});
