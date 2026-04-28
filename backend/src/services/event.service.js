const partnerModel = require('../models/partner.model');
const eventModel = require('../models/event.model');
const { HttpError } = require('../middleware/error.middleware');

const EVENT_TYPES = new Set([
  'KYC_REGISTERED',
  'TXN_SCREENED',
  'TXN_BLOCKED',
  'TXN_RELEASED',
  'INVALID_TXN',
]);

async function ingest(input) {
  const partner = await partnerModel.findById(input.partnerId);
  if (!partner || partner.status !== 'active') {
    throw new HttpError(400, 'INVALID_PARTNER', 'Partner not found or disabled');
  }

  if (!EVENT_TYPES.has(input.eventType)) {
    throw new HttpError(400, 'INVALID_EVENT_TYPE', 'Invalid event_type');
  }

  const existing = await eventModel.findByExternalId(input.externalId);
  if (existing) {
    return { event: existing, created: false };
  }

  try {
    const event = await eventModel.create({
      externalId: input.externalId,
      partnerId: input.partnerId,
      transactionId: input.transactionId,
      eventType: input.eventType,
      payload: input.payload,
    });
    return { event, created: true };
  } catch (e) {
    if (e.code === 'P2002') {
      const dup = await eventModel.findByExternalId(input.externalId);
      if (dup) return { event: dup, created: false };
    }
    throw e;
  }
}

async function listEvents(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const filter = {
    partnerId: query.partner_id,
    status: query.status,
    eventType: query.event_type,
    search: query.search,
    from: query.from,
    to: query.to,
    skip,
    take: limit,
  };

  const [items, total] = await Promise.all([
    eventModel.list(filter),
    eventModel.count(filter),
  ]);

  return { items, total, page, limit };
}

async function getEventDetail(id) {
  return eventModel.findById(id);
}

async function redeliver(id) {
  const existing = await eventModel.findById(id);
  if (!existing) {
    throw new HttpError(404, 'NOT_FOUND', 'Event not found');
  }

  const event = await eventModel.update(id, {
    status: 'retrying',
    attemptCount: 0,
    nextAttemptAt: new Date(),
    lockedAt: null,
    lockedBy: null,
    lastError: null,
    deliveredAt: null,
  });

  return event;
}

module.exports = {
  ingest,
  listEvents,
  getEventDetail,
  redeliver,
  EVENT_TYPES,
};
