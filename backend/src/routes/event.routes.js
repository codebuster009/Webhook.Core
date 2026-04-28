const { Router } = require('express');
const eventController = require('../controllers/event.controller');
const { validateBody, validateQuery } = require('../middleware/validate.middleware');
const { ingestSchema, listQuerySchema } = require('../utils/validation');

const router = Router();

router.post('/', validateBody(ingestSchema), eventController.ingest);
router.get('/', validateQuery(listQuerySchema), eventController.list);
router.get('/:id', eventController.getById);
router.post('/:id/redeliver', eventController.redeliver);

module.exports = router;
