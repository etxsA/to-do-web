import { useQuery } from '@tanstack/react-query';

import { getIcons } from '@/services/icon.service';
import { iconKeys } from '@/utils/queryKeys';

/** Seeded icon catalog. Rarely changes, so cache it for a long time. */
export function useIcons() {
  return useQuery({
    queryKey: iconKeys.all,
    queryFn: getIcons,
    staleTime: 60 * 60_000,
  });
}
