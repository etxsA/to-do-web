import type { Priority } from '@/types/api';

/** Backend dueDate is a local ISO date-time with no timezone ("2026-05-28T17:00:00"). */
export function formatDueTime(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDueDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDueDateTime(iso?: string): string {
  if (!iso) return '';
  return `${formatDueDate(iso)} · ${formatDueTime(iso)}`;
}

export function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

/** Serialize a Date to the backend's timezone-less local ISO ("YYYY-MM-DDTHH:mm:ss"). */
export function toLocalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

export const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string }> = {
  HIGH: { label: 'High', color: '#BA1A1A', bg: '#FEE2E2' },
  MEDIUM: { label: 'Medium', color: '#B45309', bg: '#FEF3C7' },
  LOW: { label: 'Low', color: '#006D2C', bg: '#DCFCE7' },
};
