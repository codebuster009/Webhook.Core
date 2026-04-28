const crypto = require('crypto');

function signPayload(secret, bodyString) {
  const h = crypto.createHmac('sha256', secret).update(bodyString, 'utf8').digest('hex');
  return `sha256=${h}`;
}

module.exports = { signPayload };
