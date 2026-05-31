/**
 * Centralized query-key factory for TanStack Query.
 *
 * Using one factory keeps keys consistent and makes cache invalidation precise
 * (e.g. after creating a task, invalidate `taskKeys.today()` and the affected
 * list's `taskKeys.byList(id)` plus `taskListKeys.withProgress()`).
 */
export const taskListKeys = {
  all: ['taskLists'] as const,
  lists: () => [...taskListKeys.all, 'list'] as const,
  page: (page: number) => [...taskListKeys.lists(), { page }] as const,
  withProgress: () => [...taskListKeys.all, 'with-oldest-pending'] as const,
  withProgressPage: (page: number) => [...taskListKeys.withProgress(), { page }] as const,
  detail: (id: number) => [...taskListKeys.all, 'detail', id] as const,
};

export const taskKeys = {
  all: ['tasks'] as const,
  byList: (listId: number) => [...taskKeys.all, 'byList', listId] as const,
  detail: (id: number) => [...taskKeys.all, 'detail', id] as const,
  today: () => [...taskKeys.all, 'today'] as const,
};

export const iconKeys = {
  all: ['icons'] as const,
  detail: (id: number) => [...iconKeys.all, 'detail', id] as const,
};

export const userKeys = {
  all: ['users'] as const,
  byFirebaseUuid: (uuid: string) => [...userKeys.all, 'firebaseUuid', uuid] as const,
};

export const searchKeys = {
  all: ['search'] as const,
  query: (q: string) => [...searchKeys.all, q] as const,
};
