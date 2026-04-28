const { config } = require('./config');
const { createLogger } = require('./config/logger');
const express = require('express');

const logger = createLogger(config);
const app = express();

app.get('/healthz', (req, res) => {
  res.json({ ok: true, data: { ok: true, db: false } });
});

app.listen(config.port, () => {
  logger.info({ port: config.port }, 'API started');
});
