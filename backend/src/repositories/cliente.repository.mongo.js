const Cliente = require('../models/Cliente.mongoose');

function toDoc(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return { ...o, id: String(o._id), _id: undefined };
}

async function findAll() {
  const list = await Cliente.find().sort({ createdAt: -1 }).lean();
  return list.map((o) => ({ ...o, id: String(o._id) }));
}

async function findById(id) {
  const doc = await Cliente.findById(id).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function findPaginated({
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
  const filter = {};
  if (search) {
    filter.$or = [
      { nombreContacto: new RegExp(search, 'i') },
      { empresa: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { telefono: new RegExp(search, 'i') },
    ];
  }
  if (estadoCliente) filter.estadoCliente = estadoCliente;
  if (servicio) filter.serviciosContratados = servicio;
  if (fechaAltaDesde || fechaAltaHasta) {
    filter.fechaAlta = {};
    if (fechaAltaDesde) filter.fechaAlta.$gte = new Date(fechaAltaDesde);
    if (fechaAltaHasta) {
      const d = new Date(fechaAltaHasta); d.setHours(23, 59, 59, 999);
      filter.fechaAlta.$lte = d;
    }
  }
  if (proximaRevisionDesde || proximaRevisionHasta) {
    filter.proximaRevision = {};
    if (proximaRevisionDesde) filter.proximaRevision.$gte = new Date(proximaRevisionDesde);
    if (proximaRevisionHasta) {
      const d = new Date(proximaRevisionHasta); d.setHours(23, 59, 59, 999);
      filter.proximaRevision.$lte = d;
    }
  }

  const total = await Cliente.countDocuments(filter);
  const skip = (page - 1) * limit;
  const list = await Cliente.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  const data = list.map((o) => ({ ...o, id: String(o._id) }));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findByTelefono(telefono, excludeId = null) {
  const normalized = (telefono || '').trim();
  if (!normalized) return null;
  const filter = { telefono: normalized };
  if (excludeId) filter._id = { $ne: excludeId };
  const doc = await Cliente.findOne(filter).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function findByEmail(email, excludeId = null) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return null;
  const filter = { email: normalized };
  if (excludeId) filter._id = { $ne: excludeId };
  const doc = await Cliente.findOne(filter).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function findByLeadOrigenId(leadOrigenId) {
  const doc = await Cliente.findOne({ leadOrigenId }).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function create(data) {
  const doc = await Cliente.create({
    nombreContacto: data.nombreContacto,
    empresa: data.empresa,
    telefono: data.telefono,
    email: data.email || '',
    ciudad: data.ciudad ?? '',
    web: data.web ?? '',
    estadoCliente: data.estadoCliente ?? 'activo',
    serviciosContratados: data.serviciosContratados ?? [],
    mrr: data.mrr != null ? data.mrr : null,
    fechaAlta: data.fechaAlta || new Date(),
    ultimaInteraccion: data.ultimaInteraccion ?? null,
    proximaRevision: data.proximaRevision ?? null,
    observacionesInternas: data.observacionesInternas ?? '',
    leadOrigenId: data.leadOrigenId ?? null,
  });
  return toDoc(doc);
}

async function update(id, data) {
  const { id: _unused, ...setData } = data;
  const doc = await Cliente.findByIdAndUpdate(id, { $set: setData }, { new: true }).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function remove(id) {
  const result = await Cliente.findByIdAndDelete(id);
  return !!result;
}

module.exports = {
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
