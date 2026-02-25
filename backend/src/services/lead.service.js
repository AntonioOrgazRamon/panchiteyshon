const { leadRepository, interaccionRepository, tareaRepository, clienteRepository } = require('../repositories');
const clienteService = require('./cliente.service');

function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

async function checkDuplicados(telefono, email, excludeId) {
  const byPhone = await leadRepository.findByTelefono(telefono, excludeId);
  if (byPhone) return { duplicate: true, field: 'telefono', message: 'Ya existe un lead con ese teléfono.' };
  const normEmail = normalizeEmail(email);
  if (normEmail) {
    const byEmail = await leadRepository.findByEmail(email, excludeId);
    if (byEmail) return { duplicate: true, field: 'email', message: 'Ya existe un lead con ese email.' };
  }
  return { duplicate: false };
}

async function ensureInteraccionPreviaSiPropuesta(leadId) {
  const list = await interaccionRepository.findByLeadId(leadId);
  return list.length > 0;
}

function getAll() {
  return leadRepository.findAll();
}

function getById(id) {
  return leadRepository.findById(id);
}

function getPaginated(params) {
  return leadRepository.findPaginated(params);
}

async function getInteracciones(leadId) {
  const lead = await leadRepository.findById(leadId);
  if (!lead) return null;
  return interaccionRepository.findByLeadId(leadId);
}

async function getTareas(leadId) {
  const lead = await leadRepository.findById(leadId);
  if (!lead) return null;
  return tareaRepository.findByLeadId(leadId);
}

async function create(body) {
  const dup = await checkDuplicados(body.telefono, body.email, null);
  if (dup.duplicate) {
    const err = new Error(dup.message);
    err.statusCode = 409;
    err.field = dup.field;
    throw err;
  }
  if (body.estadoPipeline === 'propuesta') {
    const err = new Error('No se puede crear un lead en estado "propuesta" sin interacciones previas.');
    err.statusCode = 422;
    throw err;
  }
  if (['cerrado', 'perdido'].includes(body.estadoPipeline) && body.activo !== false) {
    body.activo = false;
  }
  return leadRepository.create(body);
}

async function update(id, body, isPatch = false) {
  const existing = await leadRepository.findById(id);
  if (!existing) return null;

  const dup = await checkDuplicados(
    body.telefono ?? existing.telefono,
    body.email !== undefined ? body.email : existing.email,
    id
  );
  if (dup.duplicate) {
    const err = new Error(dup.message);
    err.statusCode = 409;
    err.field = dup.field;
    throw err;
  }

  if ((body.estadoPipeline ?? existing.estadoPipeline) === 'propuesta') {
    const interacciones = await interaccionRepository.findByLeadId(id);
    if (interacciones.length === 0) {
      const err = new Error('No se puede poner estado "propuesta" sin al menos una interacción previa.');
      err.statusCode = 422;
      throw err;
    }
  }

  if (['cerrado', 'perdido'].includes(body.estadoPipeline ?? existing.estadoPipeline)) {
    body.activo = false;
  }

  return leadRepository.update(id, isPatch ? { ...existing, ...body } : body);
}

function remove(id) {
  return leadRepository.remove(id);
}

/**
 * Convierte un lead en cliente. Crea el cliente con datos del lead + payload opcional,
 * evita duplicados por email/teléfono, marca el lead como convertido (clienteId) e inactivo.
 */
async function convertLeadToClient(leadId, payloadOpcional = {}) {
  const lead = await leadRepository.findById(leadId);
  if (!lead) return null;

  const existingCliente = await clienteRepository.findByLeadOrigenId(leadId);
  if (existingCliente) {
    const err = new Error('Este lead ya fue convertido en cliente.');
    err.statusCode = 409;
    err.existingClienteId = existingCliente.id;
    throw err;
  }

  const dup = await clienteService.checkDuplicados(lead.telefono, lead.email || '', null);
  if (dup.duplicate) {
    const err = new Error(dup.message);
    err.statusCode = 409;
    err.field = dup.field;
    throw err;
  }

  const now = new Date();
  const clienteData = {
    nombreContacto: payloadOpcional.nombreContacto ?? lead.nombre,
    empresa: payloadOpcional.empresa ?? lead.empresa,
    telefono: payloadOpcional.telefono ?? lead.telefono,
    email: payloadOpcional.email ?? lead.email ?? '',
    ciudad: payloadOpcional.ciudad ?? lead.localidad ?? '',
    web: payloadOpcional.web ?? '',
    estadoCliente: payloadOpcional.estadoCliente ?? 'activo',
    serviciosContratados: payloadOpcional.serviciosContratados ?? [],
    mrr: payloadOpcional.mrr != null ? payloadOpcional.mrr : null,
    fechaAlta: payloadOpcional.fechaAlta ?? now,
    ultimaInteraccion: payloadOpcional.ultimaInteraccion ?? lead.ultimoContacto ?? null,
    proximaRevision: payloadOpcional.proximaRevision ?? null,
    observacionesInternas: payloadOpcional.observacionesInternas ?? '',
    leadOrigenId: leadId,
  };

  const cliente = await clienteRepository.create(clienteData);
  await leadRepository.update(leadId, { clienteId: cliente.id, activo: false });
  return cliente;
}

module.exports = {
  getAll,
  getById,
  getPaginated,
  getInteracciones,
  getTareas,
  create,
  update,
  remove,
  convertLeadToClient,
  checkDuplicados,
};
