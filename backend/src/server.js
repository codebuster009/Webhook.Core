require('dotenv').config();
const { config } = require('./config');
const { createLogger } = require('./config/logger');
const { createApp } = require('./app');
const { prisma } = require('./lib/prisma');

const logger = createLogger(config);
const app = createApp();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'API started');
});

async function shutdown() {
  logger.info('Shutting down');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
