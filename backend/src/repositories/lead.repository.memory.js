const { v4: uuidv4 } = require('uuid');
const { createLead } = require('../models/lead.model');
const { seedLeads } = require('../data/run-seeds');

let store = [];

function init() {
  store = seedLeads().map((l) => ({ ...l }));
}

function findAllSync() {
  return [...store];
}

function findAll() {
  return Promise.resolve([...store]);
}

function findById(id) {
  return Promise.resolve(store.find((l) => l.id === id) ?? null);
}

function findPaginated({
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
}) {
  let list = [...store];
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (l) =>
        (l.nombre && l.nombre.toLowerCase().includes(s)) ||
        (l.empresa && l.empresa.toLowerCase().includes(s)) ||
        (l.email && l.email.toLowerCase().includes(s)) ||
        (l.telefono && l.telefono.includes(search))
    );
  }
  if (estadoPipeline) list = list.filter((l) => l.estadoPipeline === estadoPipeline);
  if (prioridad) list = list.filter((l) => l.prioridad === prioridad);
  if (canalOrigen) list = list.filter((l) => l.canalOrigen === canalOrigen);
  if (fechaCreacionDesde) {
    const d = new Date(fechaCreacionDesde);
    list = list.filter((l) => l.createdAt && new Date(l.createdAt) >= d);
  }
  if (fechaCreacionHasta) {
    const d = new Date(fechaCreacionHasta); d.setHours(23, 59, 59, 999);
    list = list.filter((l) => l.createdAt && new Date(l.createdAt) <= d);
  }
  if (ultimoContactoDesde) {
    const d = new Date(ultimoContactoDesde);
    list = list.filter((l) => l.ultimoContacto && new Date(l.ultimoContacto) >= d);
  }
  if (ultimoContactoHasta) {
    const d = new Date(ultimoContactoHasta); d.setHours(23, 59, 59, 999);
    list = list.filter((l) => l.ultimoContacto && new Date(l.ultimoContacto) <= d);
  }
  if (ticketMin !== '' && ticketMin != null) {
    const min = Number(ticketMin);
    list = list.filter((l) => (l.ticketEstimado ?? 0) >= min);
  }
  if (ticketMax !== '' && ticketMax != null) {
    const max = Number(ticketMax);
    list = list.filter((l) => (l.ticketEstimado ?? 0) <= max);
  }

  list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const total = list.length;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);
  return Promise.resolve({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
}

function findByTelefono(telefono, excludeId = null) {
  const normalized = (telefono || '').trim();
  if (!normalized) return Promise.resolve(null);
  return Promise.resolve(store.find((l) => l.telefono === normalized && l.id !== excludeId) ?? null);
}

function findByEmail(email, excludeId = null) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return Promise.resolve(null);
  return Promise.resolve(store.find((l) => l.email && l.email.toLowerCase() === normalized && l.id !== excludeId) ?? null);
}

function create(data) {
  const now = new Date();
  const lead = {
    ...createLead(data),
    id: data.id || uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  store.push(lead);
  return Promise.resolve(lead);
}

function update(id, data) {
  const idx = store.findIndex((l) => l.id === id);
  if (idx === -1) return Promise.resolve(null);
  const updated = { ...store[idx], ...data, id: store[idx].id, updatedAt: new Date() };
  store[idx] = updated;
  return Promise.resolve(updated);
}

function updateUltimoContacto(id, fecha) {
  return update(id, { ultimoContacto: fecha });
}

function remove(id) {
  const idx = store.findIndex((l) => l.id === id);
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
  create,
  update,
  updateUltimoContacto,
  remove,
};
