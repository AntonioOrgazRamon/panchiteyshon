const clienteService = require('../services/cliente.service');
const { validateCliente, validateClientePartial } = require('../validators/cliente.validator');
const { success, created, error, validationErrors } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const data = await clienteService.getAll();
    return success(res, data, 'OK', 200, { total: data.length });
  } catch (e) {
    next(e);
  }
}

async function getPaginated(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      estadoCliente = '',
      servicio = '',
      fechaAltaDesde = '',
      fechaAltaHasta = '',
      proximaRevisionDesde = '',
      proximaRevisionHasta = '',
    } = req.query;
    const result = await clienteService.getPaginated({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search: search.trim(),
      estadoCliente: estadoCliente.trim(),
      servicio: servicio.trim(),
      fechaAltaDesde: fechaAltaDesde.trim() || undefined,
      fechaAltaHasta: fechaAltaHasta.trim() || undefined,
      proximaRevisionDesde: proximaRevisionDesde.trim() || undefined,
      proximaRevisionHasta: proximaRevisionHasta.trim() || undefined,
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
    const cliente = await clienteService.getById(req.params.id);
    if (!cliente) return error(res, 'Cliente no encontrado', 404);
    return success(res, cliente);
  } catch (e) {
    next(e);
  }
}

async function post(req, res, next) {
  try {
    const parsed = validateCliente(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const entity = await clienteService.create(parsed.data);
    return created(res, entity, 'Cliente creado correctamente');
  } catch (e) {
    if (e.statusCode === 409) return error(res, e.message, 409);
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function updateById(req, res, next) {
  try {
    const parsed = validateClientePartial(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const isPatch = req.method === 'PATCH';
    const updated = await clienteService.update(req.params.id, parsed.data, isPatch);
    if (!updated) return error(res, 'Cliente no encontrado', 404);
    return success(res, updated, 'Cliente actualizado correctamente');
  } catch (e) {
    if (e.statusCode === 409) return error(res, e.message, 409);
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function deleteById(req, res, next) {
  try {
    const removed = await clienteService.remove(req.params.id);
    if (!removed) return error(res, 'Cliente no encontrado', 404);
    return success(res, { id: req.params.id }, 'Cliente eliminado correctamente');
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
