const tareaService = require('../services/tarea.service');
const { validateTarea, validateTareaPartial } = require('../validators/tarea.validator');
const { success, created, error, validationErrors } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const data = await tareaService.getAll();
    return success(res, data, 'OK', 200, { total: data.length });
  } catch (e) {
    next(e);
  }
}

async function getPaginated(req, res, next) {
  try {
    const { page = 1, limit = 10, estado = '', prioridad = '', leadId = '', clienteId = '', categoriaPlanificacion = '' } = req.query;
    const result = await tareaService.getPaginated({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      estado: estado.trim(),
      prioridad: prioridad.trim(),
      leadId: leadId.trim(),
      clienteId: clienteId.trim(),
      categoriaPlanificacion: categoriaPlanificacion.trim(),
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

async function getUpcoming(req, res, next) {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const data = await tareaService.getUpcoming(days);
    return success(res, data, 'OK', 200, { total: data.length, days });
  } catch (e) {
    next(e);
  }
}

async function getToday(req, res, next) {
  try {
    const data = await tareaService.getToday();
    return success(res, data, 'OK', 200, { total: data.length });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const item = await tareaService.getById(req.params.id);
    if (!item) return error(res, 'Tarea no encontrada', 404);
    return success(res, item);
  } catch (e) {
    next(e);
  }
}

/** Usado desde cliente.routes: GET /clientes/get/:id/tareas — :id es clienteId */
async function getByClienteId(req, res, next) {
  try {
    const data = await tareaService.getByClienteId(req.params.id);
    if (data === null) return error(res, 'Cliente no encontrado', 404);
    return success(res, data, 'OK', 200, { total: data.length });
  } catch (e) {
    next(e);
  }
}

async function post(req, res, next) {
  try {
    const parsed = validateTarea(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const entity = await tareaService.create(parsed.data);
    return created(res, entity, 'Tarea creada correctamente');
  } catch (e) {
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function updateById(req, res, next) {
  try {
    const parsed = validateTareaPartial(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const isPatch = req.method === 'PATCH';
    const updated = await tareaService.update(req.params.id, parsed.data, isPatch);
    if (!updated) return error(res, 'Tarea no encontrada', 404);
    return success(res, updated, 'Tarea actualizada correctamente');
  } catch (e) {
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function deleteById(req, res, next) {
  try {
    const removed = await tareaService.remove(req.params.id);
    if (!removed) return error(res, 'Tarea no encontrada', 404);
    return success(res, { id: req.params.id }, 'Tarea eliminada correctamente');
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getAll,
  getPaginated,
  getUpcoming,
  getToday,
  getById,
  getByClienteId,
  post,
  updateById,
  deleteById,
};
