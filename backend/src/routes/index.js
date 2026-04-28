const { Router } = require('express');
const partnerRoutes = require('./partner.routes');
const eventRoutes = require('./event.routes');

const api = Router();
api.use('/partners', partnerRoutes);
api.use('/events', eventRoutes);

module.exports = { api };
