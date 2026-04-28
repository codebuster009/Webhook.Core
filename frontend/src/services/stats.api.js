import { api } from './api.js';

function unwrap(res) {
  const body = res.data;
  if (!body.ok) {
    throw new Error(body.error?.message || 'Request failed');
  }
  return body.data;
}

export async function fetchOverview() {
  return unwrap(await api.get('/api/v1/stats/overview'));
}

export async function fetchLiveEvents() {
  const data = await unwrap(await api.get('/api/v1/stats/live-events'));
  return data.live_events;
}
