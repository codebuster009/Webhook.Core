const { prisma } = require('../lib/prisma');

function findByExternalId(externalId) {
  return prisma.event.findUnique({ where: { externalId } });
}

function create(data) {
  return prisma.event.create({
    data: {
      externalId: data.externalId,
      partnerId: data.partnerId,
      transactionId: data.transactionId,
      eventType: data.eventType,
      payload: data.payload ?? {},
      status: 'pending',
      nextAttemptAt: new Date(),
    },
  });
}

function findById(id) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      attempts: { orderBy: { attemptNumber: 'asc' } },
      partner: true,
    },
  });
}

function buildWhere(filter) {
  const {
    partnerId,
    status,
    eventType,
    search,
    from,
    to,
  } = filter;

  const parts = [];

  if (partnerId) parts.push({ partnerId });
  if (status) parts.push({ status });
  if (eventType) parts.push({ eventType });
  if (from || to) {
    const range = {};
    if (from) range.gte = new Date(from);
    if (to) range.lte = new Date(to);
    parts.push({ createdAt: range });
  }
  if (search) {
    parts.push({
      OR: [
        { externalId: { contains: search, mode: 'insensitive' } },
        { transactionId: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0];
  return { AND: parts };
}

function list(filter) {
  const { skip = 0, take = 25 } = filter;
  const where = buildWhere(filter);

  return prisma.event.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: { partner: { select: { id: true, name: true } } },
  });
}

function count(filter) {
  const where = buildWhere(filter);
  return prisma.event.count({ where });
}

function update(id, data) {
  return prisma.event.update({ where: { id }, data });
}

module.exports = {
  findByExternalId,
  create,
  findById,
  list,
  count,
  update,
};
