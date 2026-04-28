require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { config } = require('./config');
const { createLogger } = require('./config/logger');
const { prisma } = require('./lib/prisma');
const deliveryService = require('./services/delivery.service');
const { runWorkerLoop } = require('./jobs/delivery-worker');
const { startLeaseSweeper } = require('./jobs/lease-sweeper');

const logger = createLogger(config);
const concurrency = Number(process.env.WORKER_CONCURRENCY || 4);

startLeaseSweeper(logger, Number(process.env.LEASE_SWEEP_MS || 30000));

for (let i = 0; i < concurrency; i += 1) {
  const workerId = uuidv4();
  runWorkerLoop(workerId, deliveryService.deliverClaimedRow, logger).catch((err) => {
    logger.error({ err, workerId }, 'worker crashed');
    process.exit(1);
  });
}

async function shutdown() {
  logger.info('Worker shutting down');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
