const partnerService = require('../services/partner.service');
const eventService = require('../services/event.service');
const { HttpError } = require('../middleware/error.middleware');
const { normalizeWebhookUrl } = require('../utils/webhookUrl');
const { v4: uuidv4 } = require('uuid');

async function create(req, res, next) {
  try {
    const input = req.validated.body;
    const { partner, signingSecret } = await partnerService.createPartner(input);
    res.status(201).json({
      ok: true,
      data: {
        partner: toPartnerResponse(partner, { includeSecret: true, signingSecret }),
      },
    });
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const partners = await partnerService.listPartners({ take: 500 });
    res.json({
      ok: true,
      data: { partners: partners.map((p) => toPartnerResponse(p)) },
    });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const partner = await partnerService.getPartner(id);
    if (!partner) {
      throw new HttpError(404, 'NOT_FOUND', 'Partner not found');
    }
    res.json({ ok: true, data: { partner: toPartnerResponse(partner) } });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await partnerService.getPartner(id);
    if (!existing) {
      throw new HttpError(404, 'NOT_FOUND', 'Partner not found');
    }
    const partner = await partnerService.updatePartner(id, req.validated.body);
    res.json({ ok: true, data: { partner: toPartnerResponse(partner) } });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await partnerService.getPartner(id);
    if (!existing) {
      throw new HttpError(404, 'NOT_FOUND', 'Partner not found');
    }
    const partner = await partnerService.disablePartner(id);
    res.json({ ok: true, data: { partner: toPartnerResponse(partner) } });
  } catch (e) {
    next(e);
  }
}

function toPartnerResponse(partner, options = {}) {
  const { includeSecret, signingSecret } = options;
  const base = {
    id: partner.id,
    name: partner.name,
    webhookUrl: normalizeWebhookUrl(partner.webhookUrl),
    status: partner.status,
    description: partner.description,
    createdAt: partner.createdAt,
    updatedAt: partner.updatedAt,
  };
  if (includeSecret && signingSecret) {
    return { ...base, signingSecret };
  }
  return { ...base, signingSecret: '***' };
}

async function sendTest(req, res, next) {
  try {
    const partner = await partnerService.getPartner(req.params.id);
    if (!partner) {
      throw new HttpError(404, 'NOT_FOUND', 'Partner not found');
    }
    if (partner.status !== 'active') {
      throw new HttpError(400, 'PARTNER_DISABLED', 'Partner is disabled');
    }
    const externalId = `test_${uuidv4()}`;
    const { event, created } = await eventService.ingest({
      externalId,
      partnerId: partner.id,
      transactionId: `txn_test_${Date.now()}`,
      eventType: 'TXN_SCREENED',
      payload: { synthetic_test: true },
    });
    res.status(created ? 202 : 200).json({
      ok: true,
      data: { event_id: event.id, external_id: event.externalId, created },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  sendTest,
};
