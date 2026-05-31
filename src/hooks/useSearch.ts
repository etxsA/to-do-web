import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { search } from '@/services/search.service';
import { searchKeys } from '@/utils/queryKeys';

/** Debounced search query. Pass an already-debounced term; runs when non-empty. */
export function useSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: searchKeys.query(term),
    queryFn: () => search(term),
    enabled: term.length > 0,
    placeholderData: keepPreviousData,
  });
}
