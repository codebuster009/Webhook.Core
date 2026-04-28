const statsService = require('../services/stats.service');

async function overview(req, res, next) {
  try {
    const data = await statsService.getOverview();
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function liveEvents(req, res, next) {
  try {
    const live_events = await statsService.getLiveEvents();
    res.json({ ok: true, data: { live_events } });
  } catch (e) {
    next(e);
  }
}

module.exports = { overview, liveEvents };
