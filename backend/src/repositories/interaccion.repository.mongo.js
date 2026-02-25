const Interaccion = require('../models/Interaccion.mongoose');

function toDoc(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return { ...o, id: String(o._id), leadId: String(o.leadId), _id: undefined };
}

async function findAll() {
  const list = await Interaccion.find().lean();
  return list.map((o) => ({ ...o, id: String(o._id), leadId: String(o.leadId) }));
}

async function findById(id) {
  const doc = await Interaccion.findById(id).lean();
  return doc ? { ...doc, id: String(doc._id), leadId: String(doc.leadId) } : null;
}

async function findByLeadId(leadId) {
  const list = await Interaccion.find({ leadId }).lean();
  return list.map((o) => ({ ...o, id: String(o._id), leadId: String(o.leadId) }));
}

async function findPaginated({ page = 1, limit = 10, leadId = '', tipo = '', resultado = '' }) {
  const filter = {};
  if (leadId) filter.leadId = leadId;
  if (tipo) filter.tipo = tipo;
  if (resultado) filter.resultado = resultado;

  const total = await Interaccion.countDocuments(filter);
  const skip = (page - 1) * limit;
  const list = await Interaccion.find(filter).sort({ fechaInteraccion: -1 }).skip(skip).limit(limit).lean();
  const data = list.map((o) => ({ ...o, id: String(o._id), leadId: String(o.leadId) }));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function create(data) {
  const doc = await Interaccion.create({
    leadId: data.leadId,
    tipo: data.tipo,
    direccion: data.direccion,
    resumen: data.resumen,
    resultado: data.resultado,
    fechaInteraccion: data.fechaInteraccion,
    proximaAccionFecha: data.proximaAccionFecha ?? null,
    duracionMin: data.duracionMin ?? null,
  });
  return toDoc(doc);
}

async function update(id, data) {
  const { id: _unused, ...setData } = data;
  const doc = await Interaccion.findByIdAndUpdate(id, { $set: setData }, { new: true }).lean();
  return doc ? { ...doc, id: String(doc._id), leadId: String(doc.leadId) } : null;
}

async function remove(id) {
  const result = await Interaccion.findByIdAndDelete(id);
  return !!result;
}

module.exports = {
  findAll,
  findById,
  findByLeadId,
  findPaginated,
  create,
  update,
  remove,
};
