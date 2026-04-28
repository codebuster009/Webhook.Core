import { api } from './api.js';

function unwrap(res) {
  const body = res.data;
  if (!body.ok) {
    throw new Error(body.error?.message || 'Request failed');
  }
  return body.data;
}

export async function fetchPartners() {
  const data = await unwrap(await api.get('/api/v1/partners'));
  return data.partners;
}

export async function createPartner(payload) {
  const data = await unwrap(await api.post('/api/v1/partners', payload));
  return data.partner;
}

export async function updatePartner(id, payload) {
  const data = await unwrap(await api.patch(`/api/v1/partners/${id}`, payload));
  return data.partner;
}

export async function disablePartner(id) {
  const data = await unwrap(await api.delete(`/api/v1/partners/${id}`));
  return data.partner;
}

export async function sendTestEvent(partnerId) {
  const data = await unwrap(await api.post(`/api/v1/partners/${partnerId}/test`));
  return data;
}
