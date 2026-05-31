import { useQueries, useQuery } from '@tanstack/react-query';

import { getTasksByList } from '@/services/task.service';
import { getAllTaskLists } from '@/services/tasklist.service';
import type { Task } from '@/types/api';
import { taskKeys, taskListKeys } from '@/utils/queryKeys';

/**
 * Aggregate every task across all of the user's lists (deduped — a task can
 * belong to several lists). Backs the client-side "smart" virtual lists.
 * Reuses the per-list task cache, so it shares data with the list-detail screens.
 */
export function useAllTasks() {
  const listsQ = useQuery({
    queryKey: [...taskListKeys.all, 'brief'],
    queryFn: getAllTaskLists,
  });

  const listIds = (listsQ.data ?? []).map((l) => l.id);

  const taskQueries = useQueries({
    queries: listIds.map((id) => ({
      queryKey: taskKeys.byList(id),
      queryFn: () => getTasksByList(id),
    })),
  });

  const byId = new Map<number, Task>();
  taskQueries.forEach((q) => q.data?.forEach((t) => byId.set(t.id, t)));

  return {
    tasks: Array.from(byId.values()),
    isPending: listsQ.isPending || (listIds.length > 0 && taskQueries.some((q) => q.isPending)),
    isError: listsQ.isError || taskQueries.some((q) => q.isError),
    error: listsQ.error ?? taskQueries.find((q) => q.isError)?.error,
    isRefetching: listsQ.isRefetching || taskQueries.some((q) => q.isRefetching),
    refetch: () => {
      void listsQ.refetch();
      taskQueries.forEach((q) => void q.refetch());
    },
  };
}
