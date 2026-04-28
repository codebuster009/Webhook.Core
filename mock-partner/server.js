const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');

const PORT = Number(process.env.PORT || 4001);
const SECRETS_FILE = process.env.SECRETS_FILE || path.join(__dirname, 'partner-secrets.json');
/** Set DEMO_ALWAYS_OK=1 for predictable 200 responses (e.g. live demos). Default: random flaky outcomes. */
const DEMO_ALWAYS_OK = process.env.DEMO_ALWAYS_OK === '1' || process.env.DEMO_ALWAYS_OK === 'true';

function loadSecrets() {
  try {
    const raw = fs.readFileSync(SECRETS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function expectedSignature(secret, bodyString, timestamp) {
  const base = `${timestamp}.${bodyString}`;
  const h = crypto.createHmac('sha256', secret).update(base, 'utf8').digest('hex');
  return `sha256=${h}`;
}

/** Assignment backend signs raw JSON body without Stripe-style timestamp binding */
function expectedSignatureRaw(secret, bodyString) {
  const h = crypto.createHmac('sha256', secret).update(bodyString, 'utf8').digest('hex');
  return `sha256=${h}`;
}

function verifySignature(secret, bodyString, sigHeader, tsHeader) {
  if (!sigHeader || !secret) return false;
  const raw = expectedSignatureRaw(secret, bodyString);
  if (raw === sigHeader) return true;
  if (tsHeader) {
    const alt = expectedSignature(secret, bodyString, tsHeader);
    return alt === sigHeader;
  }
  return false;
}

function randomOutcome() {
  const r = Math.random();
  if (r < 0.6) return 'ok';
  if (r < 0.8) return 500;
  if (r < 0.9) return 503;
  if (r < 0.95) return 'timeout';
  return 404;
}

const app = express();

app.post('/webhook', express.raw({ type: 'application/json', limit: '1mb' }), (req, res) => {
  const bodyString = req.body.toString('utf8');
  let parsed;
  try {
    parsed = JSON.parse(bodyString);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid json' });
  }

  const secrets = loadSecrets();
  const partnerId = parsed.partner_id;
  const secret = partnerId ? secrets[partnerId] : null;
  const sig = req.headers['x-webhook-signature'];
  const ts = req.headers['x-webhook-timestamp'];

  if (secret && !verifySignature(secret, bodyString, sig, ts)) {
    console.warn('[mock-partner] invalid signature', {
      partnerId,
      id: parsed.id,
      hdr: req.headers,
    });
    return res.status(401).json({ ok: false, error: 'invalid signature' });
  }

  console.info('[mock-partner] hit', {
    id: parsed.id,
    partner_id: partnerId,
    attempt: req.headers['x-webhook-attempt'],
    sig_ok: Boolean(secret),
  });

  const outcome = DEMO_ALWAYS_OK ? 'ok' : randomOutcome();
  if (outcome === 'timeout') {
    setTimeout(() => {
      res.status(200).send('slow');
    }, 8500);
    return;
  }
  if (outcome === 'ok') {
    return res.status(200).json({ ok: true });
  }
  return res.status(outcome).json({ ok: false, code: outcome });
});

app.get('/healthz', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`mock-partner listening on ${PORT}`);
});
