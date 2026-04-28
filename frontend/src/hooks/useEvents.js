import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../services/events.api.js';

export function useEvents(params) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    placeholderData: (prev) => prev,
    refetchInterval: 3000,
  });
}
