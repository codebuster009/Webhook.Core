const eventService = require('../services/event.service');
const { HttpError } = require('../middleware/error.middleware');

function mapEvent(e) {
  if (!e) return null;
  return {
    id: e.id,
    external_id: e.externalId,
    partner_id: e.partnerId,
    transaction_id: e.transactionId,
    event_type: e.eventType,
    payload: e.payload,
    status: e.status,
    attempt_count: e.attemptCount,
    max_attempts: e.maxAttempts,
    next_attempt_at: e.nextAttemptAt,
    last_error: e.lastError,
    created_at: e.createdAt,
    delivered_at: e.deliveredAt,
    partner: e.partner
      ? { id: e.partner.id, name: e.partner.name }
      : undefined,
  };
}

function mapAttempt(a) {
  return {
    id: a.id,
    attempt_number: a.attemptNumber,
    started_at: a.startedAt,
    completed_at: a.completedAt,
    response_code: a.responseCode,
    response_body: a.responseBody,
    latency_ms: a.latencyMs,
    error_message: a.errorMessage,
    outcome: a.outcome,
  };
}

async function ingest(req, res, next) {
  try {
    const b = req.validated.body;
    const input = {
      externalId: b.external_id,
      partnerId: b.partner_id,
      transactionId: b.transaction_id,
      eventType: b.event_type,
      payload: b.payload,
    };
    const { event, created } = await eventService.ingest(input);
    const statusCode = created ? 202 : 200;
    res.status(statusCode).json({
      ok: true,
      data: { event: mapEvent(event), created },
    });
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const q = req.validated.query;
    const { items, total, page, limit } = await eventService.listEvents(q);
    res.json({
      ok: true,
      data: {
        events: items.map(mapEvent),
        total,
        page,
        limit,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const event = await eventService.getEventDetail(req.params.id);
    if (!event) {
      throw new HttpError(404, 'NOT_FOUND', 'Event not found');
    }
    res.json({
      ok: true,
      data: {
        event: mapEvent(event),
        attempts: event.attempts.map(mapAttempt),
      },
    });
  } catch (e) {
    next(e);
  }
}

async function redeliver(req, res, next) {
  try {
    const event = await eventService.redeliver(req.params.id);
    res.json({ ok: true, data: { event: mapEvent(event) } });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  ingest,
  list,
  getById,
  redeliver,
};
