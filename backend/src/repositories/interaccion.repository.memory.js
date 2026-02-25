const { v4: uuidv4 } = require('uuid');
const { createInteraccion } = require('../models/interaccion.model');
const { seedInteracciones } = require('../data/run-seeds');
const leadRepo = require('./lead.repository.memory');

let store = [];
let leadIdsCache = [];

function init() {
  leadIdsCache = leadRepo.findAllSync().map((l) => l.id);
  store = seedInteracciones(leadIdsCache, 40).map((i) => ({ ...i }));
}

function refreshLeadIds() {
  leadIdsCache = leadRepo.findAllSync().map((l) => l.id);
}

function findAll() {
  return Promise.resolve([...store]);
}

function findById(id) {
  return Promise.resolve(store.find((i) => i.id === id) ?? null);
}

function findByLeadId(leadId) {
  return Promise.resolve(store.filter((i) => i.leadId === leadId));
}

function findPaginated({ page = 1, limit = 10, leadId = '', tipo = '', resultado = '' }) {
  let list = [...store];
  if (leadId) list = list.filter((i) => i.leadId === leadId);
  if (tipo) list = list.filter((i) => i.tipo === tipo);
  if (resultado) list = list.filter((i) => i.resultado === resultado);

  const total = list.length;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);
  return Promise.resolve({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
}

function create(data) {
  refreshLeadIds();
  const now = new Date();
  const interaccion = {
    ...createInteraccion(data),
    id: data.id || uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  store.push(interaccion);
  return Promise.resolve(interaccion);
}

function update(id, data) {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return Promise.resolve(null);
  const updated = { ...store[idx], ...data, id: store[idx].id, updatedAt: new Date() };
  store[idx] = updated;
  return Promise.resolve(updated);
}

function remove(id) {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return Promise.resolve(false);
  store.splice(idx, 1);
  return Promise.resolve(true);
}

init();

module.exports = {
  init,
  findAll,
  findById,
  findByLeadId,
  findPaginated,
  create,
  update,
  remove,
};
