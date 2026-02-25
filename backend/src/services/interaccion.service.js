const { leadRepository, interaccionRepository, tareaRepository } = require('../repositories');

async function getAll() {
  return interaccionRepository.findAll();
}

function getById(id) {
  return interaccionRepository.findById(id);
}

function getPaginated(params) {
  return interaccionRepository.findPaginated(params);
}

async function create(body) {
  const lead = await leadRepository.findById(body.leadId);
  if (!lead) {
    const err = new Error('No se puede crear interacción para un lead inexistente.');
    err.statusCode = 422;
    throw err;
  }
  const fechaInteraccion = new Date(body.fechaInteraccion);
  if (body.proximaAccionFecha) {
    const proxima = new Date(body.proximaAccionFecha);
    if (proxima < fechaInteraccion) {
      const err = new Error('proximaAccionFecha no puede ser anterior a fechaInteraccion.');
      err.statusCode = 422;
      throw err;
    }
  }
  const created = await interaccionRepository.create(body);
  await leadRepository.updateUltimoContacto(body.leadId, fechaInteraccion);

  if (created.resultado === 'interesado') {
    const venc = body.proximaAccionFecha
      ? new Date(body.proximaAccionFecha)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await tareaRepository.create({
      titulo: `Seguimiento: ${lead.nombre} - ${lead.empresa}`,
      descripcion: `Auto-generada por interacción con resultado "interesado".`,
      tipo: 'seguimiento',
      estado: 'pendiente',
      prioridad: lead.prioridad || 'media',
      leadId: body.leadId,
      fechaVencimiento: venc,
      fechaRecordatorio: null,
      completada: false,
    });
  }
  return created;
}

async function update(id, body, isPatch = false) {
  const existing = await interaccionRepository.findById(id);
  if (!existing) return null;
  if (body.leadId !== undefined) {
    const lead = await leadRepository.findById(body.leadId);
    if (!lead) {
      const err = new Error('Lead inexistente.');
      err.statusCode = 422;
      throw err;
    }
  }
  const fechaInteraccion = body.fechaInteraccion ? new Date(body.fechaInteraccion) : new Date(existing.fechaInteraccion);
  const proxima = body.proximaAccionFecha !== undefined ? body.proximaAccionFecha : existing.proximaAccionFecha;
  if (proxima) {
    const proximaDate = new Date(proxima);
    if (proximaDate < fechaInteraccion) {
      const err = new Error('proximaAccionFecha no puede ser anterior a fechaInteraccion.');
      err.statusCode = 422;
      throw err;
    }
  }
  return interaccionRepository.update(id, isPatch ? { ...existing, ...body } : body);
}

function remove(id) {
  return interaccionRepository.remove(id);
}

module.exports = {
  getAll,
  getById,
  getPaginated,
  create,
  update,
  remove,
};
