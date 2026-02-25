const { leadRepository, tareaRepository, clienteRepository } = require('../repositories');

async function getAll() {
  return tareaRepository.findAll();
}

function getById(id) {
  return tareaRepository.findById(id);
}

function getPaginated(params) {
  return tareaRepository.findPaginated(params);
}

function getUpcoming(days = 7) {
  return tareaRepository.findUpcoming(days);
}

function getToday() {
  return tareaRepository.findToday();
}

async function getByClienteId(clienteId) {
  const cliente = await clienteRepository.findById(clienteId);
  if (!cliente) return null;
  return tareaRepository.findByClienteId(clienteId);
}

async function create(body) {
  const hasLead = !!body.leadId;
  const hasCliente = !!body.clienteId;
  if (hasLead && hasCliente) {
    const err = new Error('Una tarea no puede estar asociada a lead y cliente a la vez.');
    err.statusCode = 422;
    throw err;
  }
  if (body.leadId) {
    const lead = await leadRepository.findById(body.leadId);
    if (!lead) {
      const err = new Error('No se puede asignar la tarea a un lead inexistente.');
      err.statusCode = 422;
      throw err;
    }
  }
  if (body.clienteId) {
    const cliente = await clienteRepository.findById(body.clienteId);
    if (!cliente) {
      const err = new Error('No se puede asignar la tarea a un cliente inexistente.');
      err.statusCode = 422;
      throw err;
    }
  }
  if (body.fechaRecordatorio && body.fechaVencimiento) {
    if (new Date(body.fechaRecordatorio) > new Date(body.fechaVencimiento)) {
      const err = new Error('fechaRecordatorio no puede ser posterior a fechaVencimiento.');
      err.statusCode = 422;
      throw err;
    }
  }
  if (body.completada && body.estado !== 'hecha') {
    body.estado = 'hecha';
  }
  return tareaRepository.create(body);
}

async function update(id, body, isPatch = false) {
  const existing = await tareaRepository.findById(id);
  if (!existing) return null;
  const mergedLead = body.leadId !== undefined ? body.leadId : existing.leadId;
  const mergedCliente = body.clienteId !== undefined ? body.clienteId : existing.clienteId;
  if (mergedLead && mergedCliente) {
    const err = new Error('Una tarea no puede estar asociada a lead y cliente a la vez.');
    err.statusCode = 422;
    throw err;
  }
  if (body.leadId !== undefined && body.leadId !== null) {
    const lead = await leadRepository.findById(body.leadId);
    if (!lead) {
      const err = new Error('Lead inexistente.');
      err.statusCode = 422;
      throw err;
    }
  }
  if (body.clienteId !== undefined && body.clienteId !== null) {
    const cliente = await clienteRepository.findById(body.clienteId);
    if (!cliente) {
      const err = new Error('Cliente inexistente.');
      err.statusCode = 422;
      throw err;
    }
  }
  const fechaVenc = body.fechaVencimiento ? new Date(body.fechaVencimiento) : new Date(existing.fechaVencimiento);
  const fechaRec = body.fechaRecordatorio !== undefined ? body.fechaRecordatorio : existing.fechaRecordatorio;
  if (fechaRec) {
    if (new Date(fechaRec) > fechaVenc) {
      const err = new Error('fechaRecordatorio no puede ser posterior a fechaVencimiento.');
      err.statusCode = 422;
      throw err;
    }
  }
  const merged = isPatch ? { ...existing, ...body } : body;
  if (merged.completada === true && merged.estado !== 'hecha') {
    merged.estado = 'hecha';
  }
  return tareaRepository.update(id, merged);
}

function remove(id) {
  return tareaRepository.remove(id);
}

module.exports = {
  getAll,
  getById,
  getPaginated,
  getUpcoming,
  getToday,
  getByClienteId,
  create,
  update,
  remove,
};
