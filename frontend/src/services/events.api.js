import { api } from './api.js';

function unwrap(res) {
  const body = res.data;
  if (!body.ok) {
    throw new Error(body.error?.message || 'Request failed');
  }
  return body.data;
}

export async function ingestEvent(payload) {
  const res = await api.post('/api/v1/events', payload);
  const body = res.data;
  if (!body.ok) throw new Error(body.error?.message || 'Request failed');
  return body.data;
}

export async function fetchEvents(params) {
  return unwrap(await api.get('/api/v1/events', { params }));
}

export async function fetchEventDetail(id) {
  return unwrap(await api.get(`/api/v1/events/${id}`));
}

export async function redeliverEvent(id) {
  return unwrap(await api.post(`/api/v1/events/${id}/redeliver`));
}
