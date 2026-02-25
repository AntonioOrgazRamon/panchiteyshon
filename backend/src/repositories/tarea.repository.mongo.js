const Tarea = require('../models/Tarea.mongoose');

function toDoc(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    ...o,
    id: String(o._id),
    leadId: o.leadId ? String(o.leadId) : null,
    _id: undefined,
  };
}

async function findAll() {
  const list = await Tarea.find().lean();
  return list.map((o) => ({ ...o, id: String(o._id), leadId: o.leadId ? String(o.leadId) : null }));
}

async function findById(id) {
  const doc = await Tarea.findById(id).lean();
  return doc ? { ...doc, id: String(doc._id), leadId: doc.leadId ? String(doc.leadId) : null } : null;
}

async function findByLeadId(leadId) {
  const list = await Tarea.find({ leadId }).lean();
  return list.map((o) => ({ ...o, id: String(o._id), leadId: o.leadId ? String(o.leadId) : null, clienteId: o.clienteId ? String(o.clienteId) : null }));
}

async function findByClienteId(clienteId) {
  const list = await Tarea.find({ clienteId }).lean();
  return list.map((o) => ({ ...o, id: String(o._id), leadId: o.leadId ? String(o.leadId) : null, clienteId: o.clienteId ? String(o.clienteId) : null }));
}

async function findPaginated({ page = 1, limit = 10, estado = '', prioridad = '', leadId = '', clienteId = '', categoriaPlanificacion = '' }) {
  const filter = {};
  if (estado) filter.estado = estado;
  if (prioridad) filter.prioridad = prioridad;
  if (leadId) filter.leadId = leadId;
  if (clienteId) filter.clienteId = clienteId;
  if (categoriaPlanificacion) filter.categoriaPlanificacion = categoriaPlanificacion;

  const total = await Tarea.countDocuments(filter);
  const skip = (page - 1) * limit;
  const list = await Tarea.find(filter).sort({ fechaVencimiento: 1 }).skip(skip).limit(limit).lean();
  const data = list.map((o) => ({ ...o, id: String(o._id), leadId: o.leadId ? String(o.leadId) : null }));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findUpcoming(days = 7) {
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  const list = await Tarea.find({
    estado: { $nin: ['hecha', 'cancelada'] },
    fechaVencimiento: { $gte: now, $lte: limit },
  }).sort({ fechaVencimiento: 1 }).lean();
  return list.map((o) => ({ ...o, id: String(o._id), leadId: o.leadId ? String(o.leadId) : null }));
}

/** Tareas de hoy (recordatorio o vencimiento = hoy), ordenadas por hora de cierre. */
async function findToday() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const list = await Tarea.find({
    estado: { $nin: ['hecha', 'cancelada'] },
    $or: [
      { fechaRecordatorio: { $gte: startOfDay, $lte: endOfDay } },
      { fechaVencimiento: { $gte: startOfDay, $lte: endOfDay } },
    ],
  })
    .sort({ fechaVencimiento: 1, fechaRecordatorio: 1 })
    .lean();
  return list.map((o) => ({ ...o, id: String(o._id), leadId: o.leadId ? String(o.leadId) : null }));
}

async function create(data) {
  const doc = await Tarea.create({
    titulo: data.titulo,
    descripcion: data.descripcion ?? '',
    tipo: data.tipo,
    estado: data.estado,
    prioridad: data.prioridad,
    leadId: data.leadId || null,
    clienteId: data.clienteId || null,
    categoriaPlanificacion: data.categoriaPlanificacion ?? 'puntual',
    repeticion: data.repeticion ?? 'none',
    fechaProgramada: data.fechaProgramada || null,
    ordenManual: data.ordenManual ?? null,
    esHabitual: data.esHabitual ?? false,
    fechaVencimiento: data.fechaVencimiento || null,
    fechaRecordatorio: data.fechaRecordatorio ?? null,
    completada: data.completada ?? false,
  });
  return toDoc(doc);
}

async function update(id, data) {
  const { id: _unused, ...setData } = data;
  const doc = await Tarea.findByIdAndUpdate(id, { $set: setData }, { new: true }).lean();
  return doc ? { ...doc, id: String(doc._id), leadId: doc.leadId ? String(doc.leadId) : null } : null;
}

async function remove(id) {
  const result = await Tarea.findByIdAndDelete(id);
  return !!result;
}

module.exports = {
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
