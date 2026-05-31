import { http } from '@/lib/http';
import type { SearchResult } from '@/types/api';

/** Case-insensitive search across the user's lists (name/description) and tasks. */
export async function search(q: string): Promise<SearchResult> {
  const { data } = await http.get<SearchResult>('/search', { params: { q } });
  return data;
}
