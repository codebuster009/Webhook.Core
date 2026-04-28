import { useQuery } from '@tanstack/react-query';
import { fetchOverview } from '../services/stats.api.js';

export function useStatsOverview() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: fetchOverview,
    refetchInterval: 3000,
  });
}
