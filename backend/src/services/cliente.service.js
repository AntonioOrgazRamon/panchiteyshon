const { clienteRepository } = require('../repositories');

function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

async function checkDuplicados(telefono, email, excludeId) {
  const byPhone = await clienteRepository.findByTelefono(telefono, excludeId);
  if (byPhone) return { duplicate: true, field: 'telefono', message: 'Ya existe un cliente con ese teléfono.' };
  const normEmail = normalizeEmail(email);
  if (normEmail) {
    const byEmail = await clienteRepository.findByEmail(email, excludeId);
    if (byEmail) return { duplicate: true, field: 'email', message: 'Ya existe un cliente con ese email.' };
  }
  return { duplicate: false };
}

function getAll() {
  return clienteRepository.findAll();
}

function getById(id) {
  return clienteRepository.findById(id);
}

function getPaginated(params) {
  return clienteRepository.findPaginated(params);
}

async function create(body) {
  const dup = await checkDuplicados(body.telefono, body.email, null);
  if (dup.duplicate) {
    const err = new Error(dup.message);
    err.statusCode = 409;
    err.field = dup.field;
    throw err;
  }
  if (body.mrr != null && body.mrr < 0) {
    const err = new Error('MRR no puede ser negativo.');
    err.statusCode = 422;
    throw err;
  }
  return clienteRepository.create(body);
}

async function update(id, body, isPatch = false) {
  const existing = await clienteRepository.findById(id);
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
  if (body.mrr != null && body.mrr < 0) {
    const err = new Error('MRR no puede ser negativo.');
    err.statusCode = 422;
    throw err;
  }

  return clienteRepository.update(id, isPatch ? { ...existing, ...body } : body);
}

function remove(id) {
  return clienteRepository.remove(id);
}

function findByLeadOrigenId(leadOrigenId) {
  return clienteRepository.findByLeadOrigenId(leadOrigenId);
}

module.exports = {
  getAll,
  getById,
  getPaginated,
  create,
  update,
  remove,
  findByLeadOrigenId,
  checkDuplicados,
};
