import type { Task } from '@/types/api';
import { isOverdue } from '@/utils/format';

/** Client-side "smart" views aggregated across all of the user's lists. */
export type SmartListType = 'today' | 'overdue' | 'high' | 'all';

export interface SmartListDef {
  type: SmartListType;
  title: string;
  subtitle: string;
  icon: 'today' | 'warning' | 'priority-high' | 'list';
  color: string;
  filter: (task: Task) => boolean;
}

function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export const SMART_LISTS: Record<SmartListType, SmartListDef> = {
  today: {
    type: 'today',
    title: 'Today',
    subtitle: 'Due today',
    icon: 'today',
    color: '#005BBF',
    filter: (t) => !t.completed && isToday(t.dueDate),
  },
  overdue: {
    type: 'overdue',
    title: 'Overdue',
    subtitle: 'Past due',
    icon: 'warning',
    color: '#BA1A1A',
    filter: (t) => !t.completed && !isToday(t.dueDate) && isOverdue(t.dueDate),
  },
  high: {
    type: 'high',
    title: 'High Priority',
    subtitle: 'Important',
    icon: 'priority-high',
    color: '#C2410C',
    filter: (t) => !t.completed && t.priority === 'HIGH',
  },
  all: {
    type: 'all',
    title: 'All Tasks',
    subtitle: 'Everything',
    icon: 'list',
    color: '#0F766E',
    filter: () => true,
  },
};

export const SMART_LIST_ORDER: SmartListType[] = ['today', 'overdue', 'high', 'all'];

export function filterSmart(tasks: Task[], type: SmartListType): Task[] {
  return tasks.filter(SMART_LISTS[type].filter);
}
