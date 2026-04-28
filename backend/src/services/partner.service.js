const { generateSigningSecret } = require('../utils/signing');
const partnerModel = require('../models/partner.model');

async function createPartner(input) {
  const signingSecret = generateSigningSecret();
  const partner = await partnerModel.create({
    name: input.name,
    webhookUrl: input.webhookUrl,
    signingSecret,
    description: input.description ?? null,
    status: 'active',
  });
  return { partner, signingSecret };
}

async function listPartners(query = {}) {
  return partnerModel.list({
    status: query.status,
    skip: query.skip,
    take: query.take,
  });
}

async function getPartner(id) {
  return partnerModel.findById(id);
}

async function updatePartner(id, input) {
  const data = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.webhookUrl !== undefined) data.webhookUrl = input.webhookUrl;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  return partnerModel.update(id, data);
}

async function disablePartner(id) {
  return partnerModel.update(id, { status: 'disabled' });
}

module.exports = {
  createPartner,
  listPartners,
  getPartner,
  updatePartner,
  disablePartner,
};
