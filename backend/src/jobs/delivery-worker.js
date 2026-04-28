const { prisma } = require('../lib/prisma');

async function pickJob(workerId) {
  const rows = await prisma.$queryRaw`
    UPDATE "Event"
    SET status = 'in_flight',
        "lockedAt" = NOW(),
        "lockedBy" = ${workerId},
        "attemptCount" = "attemptCount" + 1
    WHERE id = (
      SELECT e.id FROM "Event" e
      WHERE e.status IN ('pending', 'retrying')
        AND e."nextAttemptAt" <= NOW()
        AND NOT EXISTS (
          SELECT 1 FROM "Event" e2
          WHERE e2."partnerId" = e."partnerId"
            AND e2.status = 'in_flight'
        )
      ORDER BY e."createdAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *;
  `;
  return rows[0] || null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWorkerLoop(workerId, deliverFn, logger) {
  for (;;) {
    try {
      const job = await pickJob(workerId);
      if (!job) {
        await sleep(500);
        continue;
      }
      await deliverFn(job);
      await sleep(0);
    } catch (err) {
      if (logger) logger.error({ err, workerId }, 'worker loop iteration failed');
      await sleep(500);
    }
  }
}

module.exports = { pickJob, runWorkerLoop };
