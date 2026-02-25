const interaccionService = require('../services/interaccion.service');
const { validateInteraccion, validateInteraccionPartial } = require('../validators/interaccion.validator');
const { success, created, error, validationErrors } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const data = await interaccionService.getAll();
    return success(res, data, 'OK', 200, { total: data.length });
  } catch (e) {
    next(e);
  }
}

async function getPaginated(req, res, next) {
  try {
    const { page = 1, limit = 10, leadId = '', tipo = '', resultado = '' } = req.query;
    const result = await interaccionService.getPaginated({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      leadId: leadId.trim(),
      tipo: tipo.trim(),
      resultado: resultado.trim(),
    });
    return success(res, result.data, 'OK', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const item = await interaccionService.getById(req.params.id);
    if (!item) return error(res, 'Interacción no encontrada', 404);
    return success(res, item);
  } catch (e) {
    next(e);
  }
}

async function post(req, res, next) {
  try {
    const parsed = validateInteraccion(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const entity = await interaccionService.create(parsed.data);
    return created(res, entity, 'Interacción creada correctamente');
  } catch (e) {
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function updateById(req, res, next) {
  try {
    const parsed = validateInteraccionPartial(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const isPatch = req.method === 'PATCH';
    const updated = await interaccionService.update(req.params.id, parsed.data, isPatch);
    if (!updated) return error(res, 'Interacción no encontrada', 404);
    return success(res, updated, 'Interacción actualizada correctamente');
  } catch (e) {
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function deleteById(req, res, next) {
  try {
    const removed = await interaccionService.remove(req.params.id);
    if (!removed) return error(res, 'Interacción no encontrada', 404);
    return success(res, { id: req.params.id }, 'Interacción eliminada correctamente');
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getAll,
  getPaginated,
  getById,
  post,
  updateById,
  deleteById,
};
