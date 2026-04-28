const { Router } = require('express');
const partnerRoutes = require('./partner.routes');
const eventRoutes = require('./event.routes');
const statsRoutes = require('./stats.routes');

const api = Router();
api.use('/partners', partnerRoutes);
api.use('/events', eventRoutes);
api.use('/stats', statsRoutes);

module.exports = { api };
