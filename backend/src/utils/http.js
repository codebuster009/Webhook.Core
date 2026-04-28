const fetch = require('node-fetch');

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_BODY_CAPTURE = 2048;
const MAX_HEADER_KEYS = 48;
const MAX_HEADER_VALUE_LEN = 512;

/** Serialize fetch Response headers with caps (for Prisma JSON). */
function captureResponseHeaders(res) {
  const out = {};
  let n = 0;
  res.headers.forEach((value, key) => {
    if (n >= MAX_HEADER_KEYS) return;
    n += 1;
    const v =
      value.length > MAX_HEADER_VALUE_LEN
        ? `${value.slice(0, MAX_HEADER_VALUE_LEN)}…`
        : value;
    out[key] = v;
  });
  return out;
}

/**
 * Copy outbound request headers for persistence (string values only).
 * @param {Record<string, string>} headers
 */
function captureRequestHeaders(headers) {
  const out = {};
  let n = 0;
  for (const [k, v] of Object.entries(headers)) {
    if (n >= MAX_HEADER_KEYS) break;
    if (typeof v !== 'string') continue;
    out[k] =
      v.length > MAX_HEADER_VALUE_LEN ? `${v.slice(0, MAX_HEADER_VALUE_LEN)}…` : v;
    n += 1;
  }
  return out;
}

async function postWebhook(url, { headers, body, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    const text = await res.text();
    const latencyMs = Date.now() - started;
    const responseBody = text.slice(0, MAX_BODY_CAPTURE);
    const responseHeaders = captureResponseHeaders(res);
    return {
      ok: res.ok,
      statusCode: res.status,
      responseBody,
      latencyMs,
      errorMessage: null,
      responseHeaders,
    };
  } catch (err) {
    const latencyMs = Date.now() - started;
    const msg = err.name === 'AbortError' ? 'timeout' : err.message;
    return {
      ok: false,
      statusCode: null,
      responseBody: '',
      latencyMs,
      errorMessage: msg,
      responseHeaders: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  postWebhook,
  DEFAULT_TIMEOUT_MS,
  captureRequestHeaders,
};
