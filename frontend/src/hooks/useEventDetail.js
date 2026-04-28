import { useQuery } from '@tanstack/react-query';
import { fetchEventDetail } from '../services/events.api.js';

const TERMINAL = new Set(['delivered', 'failed']);

export function useEventDetail(id) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventDetail(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const st = query.state.data?.event?.status;
      if (!st || TERMINAL.has(st)) return false;
      return 2000;
    },
  });
}
