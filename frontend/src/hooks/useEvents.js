import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../services/events.api.js';

/** Events list poll — near real-time. Set `VITE_EVENTS_POLL_MS` (e.g. 1000) to slow down. */
const raw = import.meta.env.VITE_EVENTS_POLL_MS;
const parsed = raw === undefined || raw === '' ? 500 : Number(raw);
const EVENTS_POLL_MS = Number.isFinite(parsed) ? Math.min(10_000, Math.max(250, parsed)) : 500;

export function useEvents(params) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
    refetchInterval: EVENTS_POLL_MS,
    /** Keep polling when the tab is in the background so the list stays current during demos. */
    refetchIntervalInBackground: true,
  });
}
