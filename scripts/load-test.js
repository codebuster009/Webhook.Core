#!/usr/bin/env node
/**
 * Simple sustained ingest load script (optional).
 * Usage: API_URL=http://localhost:3000 PARTNER_ID=... node scripts/load-test.js
 */
const api = process.env.API_URL || 'http://localhost:3000';
const partnerId = process.env.PARTNER_ID;
if (!partnerId) {
  console.error('Set PARTNER_ID');
  process.exit(1);
}

let i = 0;
async function tick() {
  const externalId = `load_${Date.now()}_${i}`;
  await fetch(`${api}/api/v1/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      external_id: externalId,
      partner_id: partnerId,
      transaction_id: `txn_load_${i}`,
      event_type: 'TXN_SCREENED',
      payload: { load: true },
    }),
  });
  i += 1;
}

const timer = setInterval(tick, 100);
setTimeout(() => {
  clearInterval(timer);
  console.log('done');
  process.exit(0);
}, 30_000);
tick();
