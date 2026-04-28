const Joi = require('joi');

const EVENT_TYPE_VALUES = [
  'KYC_REGISTERED',
  'TXN_SCREENED',
  'TXN_BLOCKED',
  'TXN_RELEASED',
  'INVALID_TXN',
];

const ingestSchema = Joi.object({
  external_id: Joi.string().min(1).max(256).required(),
  partner_id: Joi.string().required(),
  transaction_id: Joi.string().min(1).max(256).required(),
  event_type: Joi.string().valid(...EVENT_TYPE_VALUES).required(),
  payload: Joi.object().unknown(true).default({}),
});

const listQuerySchema = Joi.object({
  partner_id: Joi.string().optional(),
  status: Joi.string().optional(),
  event_type: Joi.string().optional(),
  search: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
});

module.exports = {
  EVENT_TYPE_VALUES,
  ingestSchema,
  listQuerySchema,
};
