/**
 * Ensures at least one partner exists (Demo Partner) for local Docker / first-run UX.
 * Idempotent: if any partner already exists, exits immediately.
 * Updates mock-partner/partner-secrets.json with the signing secret when creating.
 *
 * Env: API_URL (default http://localhost:3010), MOCK_URL (default http://mock-partner:4001)
 */

const fs = require('fs/promises');
const path = require('path');

async function fetchPartnerList(api) {
  const res = await fetch(`${api}/api/v1/partners`);
  const body = await res.json();
  if (!body.ok) {
    throw new Error(`GET partners failed: ${JSON.stringify(body)}`);
  }
  return body.data.partners || [];
}

async function mergeSecretFile(partnerId, signingSecret) {
  const secretsPath = path.join(__dirname, '..', 'mock-partner', 'partner-secrets.json');
  let map = {};
  try {
    const raw = await fs.readFile(secretsPath, 'utf8');
    map = JSON.parse(raw);
  } catch {
    // missing or empty file
  }
  map[partnerId] = signingSecret;
  await fs.writeFile(secretsPath, JSON.stringify(map, null, 2));
}

/**
 * Poll until the API answers, then create Demo Partner if the DB has zero partners.
 * @returns {{ created: boolean, partners: array }}
 */
async function ensureDefaultPartner(options = {}) {
  const api = options.api ?? process.env.API_URL ?? 'http://localhost:3010';
  const mockBase = (options.mock ?? process.env.MOCK_URL ?? 'http://mock-partner:4001').replace(
    /\/$/,
    ''
  );
  const silent = options.silent === true;

  for (;;) {
    try {
      let list = await fetchPartnerList(api);
      if (list.length > 0) {
        if (!silent) {
          console.log('[default-partner] already have', list.length, 'partner(s); skipping create');
        }
        return { created: false, partners: list };
      }

      const res = await fetch(`${api}/api/v1/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo Partner',
          webhookUrl: `${mockBase}/webhook`,
          description: 'Auto-created for local Docker Compose',
        }),
      });
      const body = await res.json();
      if (!body.ok) {
        throw new Error(`POST partner failed: ${JSON.stringify(body)}`);
      }
      const p = body.data.partner;
      const secret = p.signingSecret;
      if (!secret || secret === '***') {
        throw new Error('Create response missing signingSecret');
      }
      await mergeSecretFile(p.id, secret);
      if (!silent) {
        console.log('[default-partner] created partner', p.id, '— mock secrets file updated');
      }
      list = await fetchPartnerList(api);
      if (list.length === 0) {
        throw new Error('Partner not visible in list after create');
      }
      return { created: true, partners: list };
    } catch (e) {
      if (!silent) {
        console.warn('[default-partner] waiting for API or retrying:', e.message || e);
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

async function main() {
  const api = process.env.API_URL || 'http://localhost:3010';
  console.log('[default-partner] starting', { api });
  await ensureDefaultPartner({ api, silent: false });
  console.log('[default-partner] ok');
}

module.exports = { ensureDefaultPartner };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
