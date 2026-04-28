const fs = require('fs/promises');
const path = require('path');

async function main() {
  const api = process.env.API_URL || 'http://localhost:3000';
  const mock =
    process.env.MOCK_URL ||
    process.env.MOCK_WEBHOOK_BASE ||
    /* Worker runs in Docker; localhost would target the container, not the mock */
    'http://mock-partner:4001';

  const specs = [
    { name: 'Alpha Clearing', slug: 'alpha' },
    { name: 'Beacon Custody', slug: 'beacon' },
    { name: 'Cedar Payments', slug: 'cedar' },
    { name: 'Dynamo Ledger', slug: 'dynamo' },
    { name: 'Eagle Markets', slug: 'eagle' },
  ];

  const partners = [];
  const secretsMap = {};

  for (const spec of specs) {
    const res = await fetch(`${api}/api/v1/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: spec.name,
        webhookUrl: `${mock}/webhook`,
        description: spec.slug,
      }),
    });
    const body = await res.json();
    if (!body.ok) {
      throw new Error(`Partner create failed: ${JSON.stringify(body)}`);
    }
    const p = body.data.partner;
    partners.push(p);
    secretsMap[p.id] = p.signingSecret;
  }

  const secretsPath = path.join(__dirname, '..', 'mock-partner', 'partner-secrets.json');
  await fs.writeFile(secretsPath, JSON.stringify(secretsMap, null, 2));

  const types = [
    'KYC_REGISTERED',
    'TXN_SCREENED',
    'TXN_BLOCKED',
    'TXN_RELEASED',
    'INVALID_TXN',
  ];

  for (let i = 0; i < 200; i += 1) {
    const partner = partners[i % partners.length];
    const externalId = `seed_${i}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const res = await fetch(`${api}/api/v1/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        external_id: externalId,
        partner_id: partner.id,
        transaction_id: `txn_seed_${i}`,
        event_type: types[i % types.length],
        payload: { index: i, demo: true },
      }),
    });
    const body = await res.json();
    if (!body.ok) {
      console.warn('ingest issue', res.status, body);
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log('Seed complete:', { partners: partners.length, events: 200, secretsPath });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
