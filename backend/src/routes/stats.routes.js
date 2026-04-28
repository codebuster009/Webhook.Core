const { Router } = require('express');
const statsController = require('../controllers/stats.controller');

const router = Router();

router.get('/overview', statsController.overview);
router.get('/live-events', statsController.liveEvents);

module.exports = router;
