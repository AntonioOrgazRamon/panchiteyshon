const { v4: uuidv4 } = require('uuid');
const { createCliente } = require('../models/cliente.model');

let store = [];

function init() {
  try {
    const { seedClientes } = require('../data/run-seeds');
    const list = seedClientes ? seedClientes() : [];
    store = Array.isArray(list) ? list.map((c) => ({ ...c })) : [];
  } catch (_) {
    store = [];
  }
}

function findAllSync() {
  return [...store];
}

function findAll() {
  return Promise.resolve([...store]);
}

function findById(id) {
  return Promise.resolve(store.find((c) => c.id === id) ?? null);
}

function findPaginated({
  page = 1,
  limit = 10,
  search = '',
  estadoCliente = '',
  servicio = '',
  fechaAltaDesde = '',
  fechaAltaHasta = '',
  proximaRevisionDesde = '',
  proximaRevisionHasta = '',
}) {
  let list = [...store];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (c) =>
        (c.nombreContacto && c.nombreContacto.toLowerCase().includes(s)) ||
        (c.empresa && c.empresa.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.telefono && c.telefono.includes(search))
    );
  }
  if (estadoCliente) list = list.filter((c) => c.estadoCliente === estadoCliente);
  if (servicio) list = list.filter((c) => c.serviciosContratados && c.serviciosContratados.includes(servicio));
  if (fechaAltaDesde) {
    const d = new Date(fechaAltaDesde);
    list = list.filter((c) => c.fechaAlta && new Date(c.fechaAlta) >= d);
  }
  if (fechaAltaHasta) {
    const d = new Date(fechaAltaHasta);
    d.setHours(23, 59, 59, 999);
    list = list.filter((c) => c.fechaAlta && new Date(c.fechaAlta) <= d);
  }
  if (proximaRevisionDesde) {
    const d = new Date(proximaRevisionDesde);
    list = list.filter((c) => c.proximaRevision && new Date(c.proximaRevision) >= d);
  }
  if (proximaRevisionHasta) {
    const d = new Date(proximaRevisionHasta);
    d.setHours(23, 59, 59, 999);
    list = list.filter((c) => c.proximaRevision && new Date(c.proximaRevision) <= d);
  }

  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const total = list.length;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);
  return Promise.resolve({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
}

function findByTelefono(telefono, excludeId = null) {
  const normalized = (telefono || '').trim();
  if (!normalized) return Promise.resolve(null);
  return Promise.resolve(store.find((c) => c.telefono === normalized && c.id !== excludeId) ?? null);
}

function findByEmail(email, excludeId = null) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return Promise.resolve(null);
  return Promise.resolve(store.find((c) => c.email && c.email.toLowerCase() === normalized && c.id !== excludeId) ?? null);
}

function findByLeadOrigenId(leadOrigenId) {
  return Promise.resolve(store.find((c) => c.leadOrigenId === leadOrigenId) ?? null);
}

function create(data) {
  const now = new Date();
  const cliente = {
    ...createCliente(data),
    id: data.id || uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  store.push(cliente);
  return Promise.resolve(cliente);
}

function update(id, data) {
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) return Promise.resolve(null);
  const updated = { ...store[idx], ...data, id: store[idx].id, updatedAt: new Date() };
  store[idx] = updated;
  return Promise.resolve(updated);
}

function remove(id) {
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) return Promise.resolve(false);
  store.splice(idx, 1);
  return Promise.resolve(true);
}

init();

module.exports = {
  init,
  findAllSync,
  findAll,
  findById,
  findPaginated,
  findByTelefono,
  findByEmail,
  findByLeadOrigenId,
  create,
  update,
  remove,
};
