const { v4: uuidv4 } = require('uuid');
const { createTarea } = require('../models/tarea.model');
const { seedTareas } = require('../data/run-seeds');
const leadRepo = require('./lead.repository.memory');

let store = [];
let leadIdsCache = [];

function init() {
  leadIdsCache = leadRepo.findAllSync().map((l) => l.id);
  store = seedTareas(leadIdsCache, 20).map((t) => ({ ...t }));
}

function refreshLeadIds() {
  leadIdsCache = leadRepo.findAllSync().map((l) => l.id);
}

function findAll() {
  return Promise.resolve([...store]);
}

function findById(id) {
  return Promise.resolve(store.find((t) => t.id === id) ?? null);
}

function findByLeadId(leadId) {
  return Promise.resolve(store.filter((t) => t.leadId === leadId));
}

function findByClienteId(clienteId) {
  return Promise.resolve(store.filter((t) => t.clienteId === clienteId));
}

function findPaginated({ page = 1, limit = 10, estado = '', prioridad = '', leadId = '', clienteId = '', categoriaPlanificacion = '' }) {
  let list = [...store];
  if (estado) list = list.filter((t) => t.estado === estado);
  if (prioridad) list = list.filter((t) => t.prioridad === prioridad);
  if (leadId) list = list.filter((t) => t.leadId === leadId);
  if (clienteId) list = list.filter((t) => t.clienteId === clienteId);
  if (categoriaPlanificacion) list = list.filter((t) => (t.categoriaPlanificacion || 'puntual') === categoriaPlanificacion);

  const total = list.length;
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);
  return Promise.resolve({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
}

function findUpcoming(days = 7) {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + days);
  const now = new Date();
  const list = store.filter(
    (t) =>
      t.estado !== 'hecha' &&
      t.estado !== 'cancelada' &&
      t.fechaVencimiento &&
      new Date(t.fechaVencimiento) >= now &&
      new Date(t.fechaVencimiento) <= limitDate
  );
  return Promise.resolve(list);
}

/** Tareas de hoy: recordatorio o vencimiento = hoy, ordenadas por hora de cierre (asc). */
function findToday() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const isSameDay = (d) => {
    if (!d) return false;
    const dt = new Date(d);
    return dt >= startOfDay && dt <= endOfDay;
  };
  const list = store.filter(
    (t) =>
      t.estado !== 'hecha' &&
      t.estado !== 'cancelada' &&
      (isSameDay(t.fechaRecordatorio) || isSameDay(t.fechaVencimiento))
  );
  const byClosing = (t) => {
    const v = t.fechaVencimiento ? new Date(t.fechaVencimiento).getTime() : null;
    const r = t.fechaRecordatorio ? new Date(t.fechaRecordatorio).getTime() : null;
    return v ?? r ?? 0;
  };
  list.sort((a, b) => byClosing(a) - byClosing(b));
  return Promise.resolve(list);
}

function create(data) {
  refreshLeadIds();
  const now = new Date();
  const tarea = {
    ...createTarea(data),
    id: data.id || uuidv4(),
    clienteId: data.clienteId ?? null,
    categoriaPlanificacion: data.categoriaPlanificacion ?? 'puntual',
    repeticion: data.repeticion ?? 'none',
    fechaProgramada: data.fechaProgramada ?? null,
    ordenManual: data.ordenManual ?? null,
    esHabitual: data.esHabitual ?? false,
    createdAt: now,
    updatedAt: now,
  };
  store.push(tarea);
  return Promise.resolve(tarea);
}

function update(id, data) {
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return Promise.resolve(null);
  const updated = { ...store[idx], ...data, id: store[idx].id, updatedAt: new Date() };
  store[idx] = updated;
  return Promise.resolve(updated);
}

function remove(id) {
  const idx = store.findIndex((t) => t.id === id);
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
  findByClienteId,
  findPaginated,
  findUpcoming,
  findToday,
  create,
  update,
  remove,
};
