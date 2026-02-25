const dashboardService = require('../services/dashboard.service');
const { success } = require('../utils/response');

async function getSummary(req, res, next) {
  try {
    const { limitLeads = 10, limitTareas = 15, limitActividad = 20 } = req.query;
    const data = await dashboardService.getSummary({
      limitLeads: parseInt(limitLeads, 10) || 10,
      limitTareas: parseInt(limitTareas, 10) || 15,
      limitActividad: parseInt(limitActividad, 10) || 20,
    });
    return success(res, data, 'OK');
  } catch (e) {
    next(e);
  }
}

module.exports = { getSummary };
