import type { Priority, Task } from '@/types/api';

export type TaskSort = 'due' | 'priority' | 'title';
export type TaskStatusFilter = 'all' | 'pending' | 'completed';

const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/** Stable sort by the chosen key. Tasks without a due date sort last. */
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks];
  switch (sort) {
    case 'priority':
      return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'due':
    default:
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }
}

export function filterByStatus(tasks: Task[], status: TaskStatusFilter): Task[] {
  if (status === 'pending') return tasks.filter((t) => !t.completed);
  if (status === 'completed') return tasks.filter((t) => t.completed);
  return tasks;
}

export const SORT_LABELS: Record<TaskSort, string> = {
  due: 'Due date',
  priority: 'Priority',
  title: 'Title',
};

export const STATUS_LABELS: Record<TaskStatusFilter, string> = {
  all: 'All',
  pending: 'Pending',
  completed: 'Done',
};
