const { prisma } = require('../lib/prisma');

async function getOverview() {
  const minuteAgo = new Date(Date.now() - 60 * 1000);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentCreated = await prisma.event.count({
    where: { createdAt: { gte: minuteAgo } },
  });
  const ingestion_rate = Number((recentCreated / 60).toFixed(2));

  const delivered60 = await prisma.event.count({
    where: {
      status: 'delivered',
      deliveredAt: { gte: hourAgo },
    },
  });
  const failed60 = await prisma.event.count({
    where: {
      status: 'failed',
      attempts: { some: { completedAt: { gte: hourAgo } } },
    },
  });
  const finished = delivered60 + failed60;
  const success_rate = finished === 0 ? 1 : Number((delivered60 / finished).toFixed(4));

  const active_retries = await prisma.event.count({
    where: { status: { in: ['pending', 'in_flight', 'retrying'] } },
  });

  const failed_last_60m = failed60;

  let deliveries_timeseries = [];
  let latency_timeseries = [];
  try {
    const buckets = await prisma.$queryRaw`
      SELECT
        date_trunc('hour', a."completedAt") AS bucket,
        COUNT(*)::int AS cnt,
        COALESCE(AVG(a."latencyMs")::float, 0) AS avg_lat
      FROM "DeliveryAttempt" a
      WHERE a."completedAt" >= NOW() - INTERVAL '24 hours'
        AND a.outcome = 'success'
      GROUP BY 1
      ORDER BY 1 ASC;
    `;
    deliveries_timeseries = buckets.map((row) => ({
      ts: row.bucket,
      deliveries: Number(row.cnt),
    }));
    latency_timeseries = buckets.map((row) => ({
      ts: row.bucket,
      latency_ms: Math.round(row.avg_lat || 0),
    }));
  } catch {
    deliveries_timeseries = [];
    latency_timeseries = [];
  }

  const live = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      partner: { select: { name: true } },
      attempts: {
        take: 1,
        orderBy: { attemptNumber: 'desc' },
      },
    },
  });

  const live_events = live.map((e) => ({
    id: e.id,
    partner_name: e.partner?.name || '—',
    event_type: e.eventType,
    status: e.status,
    created_at: e.createdAt,
    last_latency_ms: e.attempts[0]?.latencyMs ?? null,
    last_code: e.attempts[0]?.responseCode ?? null,
  }));

  const partners = await prisma.partner.findMany({
    include: {
      _count: { select: { events: true } },
    },
  });

  const endpoint_summary = [];
  for (const p of partners) {
    const agg = await prisma.deliveryAttempt.aggregate({
      where: {
        outcome: 'success',
        latencyMs: { not: null },
        event: { partnerId: p.id },
      },
      _avg: { latencyMs: true },
    });
    const ok = await prisma.deliveryAttempt.count({
      where: { outcome: 'success', event: { partnerId: p.id } },
    });
    const bad = await prisma.deliveryAttempt.count({
      where: { outcome: 'terminated', event: { partnerId: p.id } },
    });
    const attempts = ok + bad;
    endpoint_summary.push({
      partner_id: p.id,
      name: p.name,
      endpoint_key: p.name.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase().slice(0, 24),
      total_volume: p._count.events,
      uptime_pct: attempts === 0 ? 100 : Math.round((ok / attempts) * 10000) / 100,
      avg_latency_ms: Math.round(agg._avg.latencyMs || 0),
      error_rate_pct: attempts === 0 ? 0 : Math.round((bad / attempts) * 10000) / 100,
    });
  }

  return {
    ingestion_rate,
    success_rate,
    active_retries,
    failed_last_60m,
    deliveries_timeseries,
    latency_timeseries,
    live_events,
    endpoint_summary,
  };
}

async function getLiveEvents() {
  const live = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      partner: { select: { name: true } },
      attempts: { take: 1, orderBy: { attemptNumber: 'desc' } },
    },
  });
  return live.map((e) => ({
    id: e.id,
    partner_name: e.partner?.name || '—',
    event_type: e.eventType,
    status: e.status,
    created_at: e.createdAt,
    last_latency_ms: e.attempts[0]?.latencyMs ?? null,
    last_code: e.attempts[0]?.responseCode ?? null,
  }));
}

module.exports = {
  getOverview,
  getLiveEvents,
};
