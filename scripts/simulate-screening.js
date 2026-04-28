/**
 * Mimics an upstream screening engine: POSTs events to the ingestion API on an interval.
 * Run from repo root: API_URL=http://localhost:3010 node scripts/simulate-screening.js
 * Docker Compose also starts this as service `simulate-screening` (API_URL=http://backend:3000).
 *
 * Env:
 *   API_URL          — default http://localhost:3010
 *   INTERVAL_MS      — default 12000 (12s)
 *   EVENTS_PER_TICK  — default 4
 *   PARTNER_IDS      — optional comma-separated partner ids (subset)
 *   DEDUP_EVERY      — if set (e.g. 20), after every N successful unique ingests, POST same external_id once (idempotent demo)
 */

const { ensureDefaultPartner } = require('./ensure-default-partner.js');

const api = process.env.API_URL || 'http://localhost:3010';
const INTERVAL_MS = Math.max(1000, Number(process.env.INTERVAL_MS) || 12000);
const EVENTS_PER_TICK = Math.min(20, Math.max(1, Number(process.env.EVENTS_PER_TICK) || 4));
const PARTNER_IDS_FILTER = process.env.PARTNER_IDS
  ? new Set(
      process.env.PARTNER_IDS.split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  : null;
const DEDUP_EVERY = Math.max(0, parseInt(process.env.DEDUP_EVERY, 10) || 0);

const EVENT_TYPES = [
  'KYC_REGISTERED',
  'TXN_SCREENED',
  'TXN_BLOCKED',
  'TXN_RELEASED',
  'INVALID_TXN',
];

let tick = 0;
let uniqueSuccessCount = 0;
/** @type {{ externalId: string, partnerId: string, eventType: string, transactionId: string } | null} */
let lastIngest = null;
let shuttingDown = false;

async function fetchPartners() {
  const res = await fetch(`${api}/api/v1/partners`);
  const body = await res.json();
  if (!body.ok) {
    throw new Error(`GET partners failed: ${JSON.stringify(body)}`);
  }
  let list = body.data.partners || [];
  if (PARTNER_IDS_FILTER && PARTNER_IDS_FILTER.size > 0) {
    list = list.filter((p) => PARTNER_IDS_FILTER.has(p.id));
  }
  return list;
}

/** After ensureDefaultPartner, poll until filtered partner list is non-empty (API flakiness / PARTNER_IDS). */
async function waitForUsablePartners() {
  for (;;) {
    try {
      const list = await fetchPartners();
      if (list.length > 0) return list;
      console.log('[sim] no partners match filter or list empty — retry in 5s…');
    } catch (e) {
      console.warn('[sim] API not ready:', e.message || e, '— retry in 5s');
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}

async function ingestOne(partnerId, externalId, eventType, txnId, idx) {
  const res = await fetch(`${api}/api/v1/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      external_id: externalId,
      partner_id: partnerId,
      transaction_id: txnId,
      event_type: eventType,
      payload: {
        source: 'screening_sim',
        tick,
        idx,
        ts: new Date().toISOString(),
      },
    }),
  });
  const body = await res.json();
  return { res, body };
}

async function runTick(partners) {
  tick += 1;
  const n = partners.length;

  for (let i = 0; i < EVENTS_PER_TICK; i += 1) {
    const partner = partners[i % n];
    const eventType = EVENT_TYPES[(tick + i) % EVENT_TYPES.length];
    const externalId = `sim_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
    const txnId = `txn_scr_${Date.now()}_${i}_${tick}`;

    const { res, body } = await ingestOne(partner.id, externalId, eventType, txnId, i);

    if (!body.ok) {
      console.warn('[sim] ingest failed', res.status, body.error || body);
      continue;
    }

    const created = body.data?.created !== false;
    const eid = body.data?.event?.id || body.data?.event?.external_id || externalId;
    console.log(
      `[sim] ingested external_id=${externalId} partner=${partner.name || partner.id} type=${eventType} created=${created} event_id=${eid}`
    );

    lastIngest = {
      externalId,
      partnerId: partner.id,
      eventType,
      transactionId: txnId,
    };
    uniqueSuccessCount += 1;

    if (
      DEDUP_EVERY > 0 &&
      lastIngest &&
      uniqueSuccessCount % DEDUP_EVERY === 0
    ) {
      const dup = await ingestOne(
        lastIngest.partnerId,
        lastIngest.externalId,
        lastIngest.eventType,
        lastIngest.transactionId,
        i
      );
      const dupBody = dup.body;
      const dupCreated = dupBody.data?.created;
      const dupId = dupBody.data?.event?.id;
      if (dupBody.ok) {
        console.log(
          `[sim] dedup demo same external_id=${lastIngest.externalId} idempotent created=${dupCreated} event_id=${dupId} (expect created=false)`
        );
      } else {
        console.warn('[sim] dedup POST failed', dupBody);
      }
    }
  }
}

async function main() {
  console.log('[sim] screening simulator starting', {
    api,
    INTERVAL_MS,
    EVENTS_PER_TICK,
    DEDUP_EVERY: DEDUP_EVERY || 'off',
    PARTNER_IDS: PARTNER_IDS_FILTER ? [...PARTNER_IDS_FILTER].join(',') : 'all active',
  });

  await ensureDefaultPartner({
    api,
    mock: process.env.MOCK_URL,
    silent: false,
  });

  const partners = await waitForUsablePartners();

  console.log(
    `[sim] using ${partners.length} partner(s):`,
    partners.map((p) => p.name || p.id).join(', ')
  );

  const loop = async () => {
    if (shuttingDown) return;
    try {
      await runTick(partners);
    } catch (e) {
      console.error('[sim] tick error', e.message || e);
    }
    if (!shuttingDown) {
      setTimeout(loop, INTERVAL_MS);
    }
  };

  loop();

  process.on('SIGINT', () => {
    shuttingDown = true;
    console.log('\n[sim] shutting down');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
