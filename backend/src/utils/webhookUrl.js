/**
 * Docker Compose service name is `mock-partner`. A common typo `moc-partner`
 * breaks DNS inside the network; normalize at save and at delivery.
 */
function normalizeWebhookUrl(url) {
  if (!url || typeof url !== 'string') return url;
  try {
    const u = new URL(url);
    if (u.hostname === 'moc-partner') {
      u.hostname = 'mock-partner';
      return u.toString();
    }
  } catch {
    // leave invalid URLs to Joi / HTTP layer
  }
  return url;
}

module.exports = { normalizeWebhookUrl };
