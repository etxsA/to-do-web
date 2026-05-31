import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/utils/errors';

/**
 * Shared TanStack Query client. Centralizes caching, refetch, and retry policy.
 *
 * Retry policy: don't retry client errors (4xx) — they won't succeed on retry
 * and 401 is already handled (refresh + logout) by the http interceptor.
 * Network/5xx errors retry a couple of times.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
