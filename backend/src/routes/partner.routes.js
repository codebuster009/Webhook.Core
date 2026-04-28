const { Router } = require('express');
const Joi = require('joi');
const partnerController = require('../controllers/partner.controller');
const { validateBody } = require('../middleware/validate.middleware');

const createSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  webhookUrl: Joi.string().uri().required(),
  description: Joi.string().allow('').max(2000).optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  webhookUrl: Joi.string().uri().optional(),
  description: Joi.string().allow('').max(2000).optional(),
  status: Joi.string().valid('active', 'disabled').optional(),
}).min(1);

const router = Router();

router.post('/', validateBody(createSchema), partnerController.create);
router.get('/', partnerController.list);
router.get('/:id', partnerController.getById);
router.patch('/:id', validateBody(updateSchema), partnerController.update);
router.delete('/:id', partnerController.remove);

module.exports = router;
