const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { requestIdMiddleware } = require('./middleware/request-id.middleware');
const { notFoundHandler, errorMiddleware } = require('./middleware/error.middleware');
const { api } = require('./routes');
const { prisma } = require('./lib/prisma');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestIdMiddleware);

  app.get('/healthz', async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, data: { ok: true, db: true } });
    } catch {
      res.json({ ok: true, data: { ok: true, db: false } });
    }
  });

  app.use('/api/v1', api);
  app.use(notFoundHandler);
  app.use(errorMiddleware);
  return app;
}

module.exports = { createApp };
