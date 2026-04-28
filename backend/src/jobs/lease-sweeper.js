const { prisma } = require('../lib/prisma');

async function sweepStaleInFlight() {
  await prisma.$executeRaw`
    UPDATE "Event"
    SET status = 'retrying', "lockedAt" = NULL, "lockedBy" = NULL
    WHERE status = 'in_flight'
      AND "lockedAt" < NOW() - INTERVAL '60 seconds';
  `;
}

function startLeaseSweeper(logger, intervalMs = 30000) {
  const tick = () => {
    sweepStaleInFlight().catch((err) => {
      if (logger) logger.error({ err }, 'lease sweep failed');
    });
  };
  tick();
  const timer = setInterval(tick, intervalMs);
  return () => clearInterval(timer);
}

module.exports = { sweepStaleInFlight, startLeaseSweeper };
