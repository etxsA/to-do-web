import { http } from '@/lib/http';
import type { Icon } from '@/types/api';

/** Read-only seeded icon catalog (ids 1–15). */
export async function getIcons(): Promise<Icon[]> {
  const { data } = await http.get<Icon[]>('/icon');
  return data;
}
