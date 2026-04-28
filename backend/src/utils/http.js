const fetch = require('node-fetch');

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_BODY_CAPTURE = 2048;

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
    return {
      ok: res.ok,
      statusCode: res.status,
      responseBody,
      latencyMs,
      errorMessage: null,
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
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { postWebhook, DEFAULT_TIMEOUT_MS };
