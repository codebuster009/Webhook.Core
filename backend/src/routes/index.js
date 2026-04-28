const { Router } = require('express');
const partnerRoutes = require('./partner.routes');

const api = Router();
api.use('/partners', partnerRoutes);

module.exports = { api };
