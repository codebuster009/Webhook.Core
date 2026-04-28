const crypto = require('crypto');

/**
 * One-time reveal on partner create. Format: whsec_<base64url>
 */
function generateSigningSecret() {
  const raw = crypto.randomBytes(24).toString('base64url');
  return `whsec_${raw}`;
}

module.exports = { generateSigningSecret };
