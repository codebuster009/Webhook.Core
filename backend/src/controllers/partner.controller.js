const partnerService = require('../services/partner.service');
const { HttpError } = require('../middleware/error.middleware');

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
    webhookUrl: partner.webhookUrl,
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

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
};
