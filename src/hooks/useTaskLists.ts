import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getTaskList, getTaskListsWithProgress } from '@/services/tasklist.service';
import { taskListKeys } from '@/utils/queryKeys';

/** Infinite, progress-enriched lists for the Home screen. */
export function useTaskListsWithProgress() {
  return useInfiniteQuery({
    queryKey: taskListKeys.withProgress(),
    queryFn: ({ pageParam }) => getTaskListsWithProgress(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });
}

export function useTaskList(id: number) {
  return useQuery({
    queryKey: taskListKeys.detail(id),
    queryFn: () => getTaskList(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
