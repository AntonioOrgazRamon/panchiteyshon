const leadService = require('../services/lead.service');
const { validateLead, validateLeadPartial } = require('../validators/lead.validator');
const { success, created, error, validationErrors } = require('../utils/response');

async function getAll(req, res, next) {
  try {
    const data = await leadService.getAll();
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
      estadoPipeline = '',
      prioridad = '',
      canalOrigen = '',
      fechaCreacionDesde = '',
      fechaCreacionHasta = '',
      ultimoContactoDesde = '',
      ultimoContactoHasta = '',
      ticketMin = '',
      ticketMax = '',
    } = req.query;
    const result = await leadService.getPaginated({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search: search.trim(),
      estadoPipeline: estadoPipeline.trim(),
      prioridad: prioridad.trim(),
      canalOrigen: canalOrigen.trim(),
      fechaCreacionDesde: fechaCreacionDesde.trim() || undefined,
      fechaCreacionHasta: fechaCreacionHasta.trim() || undefined,
      ultimoContactoDesde: ultimoContactoDesde.trim() || undefined,
      ultimoContactoHasta: ultimoContactoHasta.trim() || undefined,
      ticketMin: ticketMin !== '' ? ticketMin : undefined,
      ticketMax: ticketMax !== '' ? ticketMax : undefined,
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
    const lead = await leadService.getById(req.params.id);
    if (!lead) return error(res, 'Lead no encontrado', 404);
    return success(res, lead);
  } catch (e) {
    next(e);
  }
}

async function getInteracciones(req, res, next) {
  try {
    const data = await leadService.getInteracciones(req.params.id);
    if (data === null) return error(res, 'Lead no encontrado', 404);
    return success(res, data, 'OK', 200, { total: data.length });
  } catch (e) {
    next(e);
  }
}

async function getTareas(req, res, next) {
  try {
    const data = await leadService.getTareas(req.params.id);
    if (data === null) return error(res, 'Lead no encontrado', 404);
    return success(res, data, 'OK', 200, { total: data.length });
  } catch (e) {
    next(e);
  }
}

async function exportCsv(req, res, next) {
  try {
    const leads = await leadService.getAll();
    const headers = ['nombre', 'empresa', 'telefono', 'email', 'canalOrigen', 'estadoPipeline', 'prioridad', 'ticketEstimado', 'localidad', 'activo', 'fechaAlta', 'ultimoContacto'];
    const escape = (v) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const line = (row) => headers.map((h) => escape(row[h])).join(',');
    const csv = ['\uFEFF' + headers.join(','), ...leads.map(line)].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    return res.send(csv);
  } catch (e) {
    next(e);
  }
}

async function post(req, res, next) {
  try {
    const parsed = validateLead(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const entity = await leadService.create(parsed.data);
    return created(res, entity, 'Lead creado correctamente');
  } catch (e) {
    if (e.statusCode === 409) return error(res, e.message, 409);
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function updateById(req, res, next) {
  try {
    const parsed = validateLeadPartial(req.body);
    if (!parsed.success) return validationErrors(res, parsed.error);
    const isPatch = req.method === 'PATCH';
    const updated = await leadService.update(req.params.id, parsed.data, isPatch);
    if (!updated) return error(res, 'Lead no encontrado', 404);
    return success(res, updated, 'Lead actualizado correctamente');
  } catch (e) {
    if (e.statusCode === 409) return error(res, e.message, 409);
    if (e.statusCode === 422) return error(res, e.message, 422);
    next(e);
  }
}

async function deleteById(req, res, next) {
  try {
    const removed = await leadService.remove(req.params.id);
    if (!removed) return error(res, 'Lead no encontrado', 404);
    return success(res, { id: req.params.id }, 'Lead eliminado correctamente');
  } catch (e) {
    next(e);
  }
}

async function convertirCliente(req, res, next) {
  try {
    const cliente = await leadService.convertLeadToClient(req.params.id, req.body || {});
    if (!cliente) return error(res, 'Lead no encontrado', 404);
    return success(res, cliente, 'Lead convertido en cliente correctamente', 200, { clienteId: cliente.id });
  } catch (e) {
    if (e.statusCode === 409) return error(res, e.message, 409, e.existingClienteId ? [{ field: 'clienteId', message: e.existingClienteId }] : undefined);
    next(e);
  }
}

module.exports = {
  getAll,
  getPaginated,
  getById,
  getInteracciones,
  getTareas,
  exportCsv,
  post,
  updateById,
  deleteById,
  convertirCliente,
};
