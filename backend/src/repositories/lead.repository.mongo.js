const Lead = require('../models/Lead.mongoose');

function toDoc(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return { ...o, id: String(o._id), _id: undefined };
}

async function findAll() {
  const list = await Lead.find().lean();
  return list.map((o) => ({ ...o, id: String(o._id) }));
}

async function findById(id) {
  const doc = await Lead.findById(id).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function findPaginated({
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
  const filter = {};
  if (search) {
    filter.$or = [
      { nombre: new RegExp(search, 'i') },
      { empresa: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { telefono: new RegExp(search, 'i') },
    ];
  }
  if (estadoPipeline) filter.estadoPipeline = estadoPipeline;
  if (prioridad) filter.prioridad = prioridad;
  if (canalOrigen) filter.canalOrigen = canalOrigen;
  if (fechaCreacionDesde || fechaCreacionHasta) {
    filter.createdAt = {};
    if (fechaCreacionDesde) filter.createdAt.$gte = new Date(fechaCreacionDesde);
    if (fechaCreacionHasta) {
      const d = new Date(fechaCreacionHasta); d.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = d;
    }
  }
  if (ultimoContactoDesde || ultimoContactoHasta) {
    filter.ultimoContacto = {};
    if (ultimoContactoDesde) filter.ultimoContacto.$gte = new Date(ultimoContactoDesde);
    if (ultimoContactoHasta) {
      const d = new Date(ultimoContactoHasta); d.setHours(23, 59, 59, 999);
      filter.ultimoContacto.$lte = d;
    }
  }
  if (ticketMin !== '' && ticketMin != null || ticketMax !== '' && ticketMax != null) {
    filter.ticketEstimado = {};
    if (ticketMin !== '' && ticketMin != null) filter.ticketEstimado.$gte = Number(ticketMin);
    if (ticketMax !== '' && ticketMax != null) filter.ticketEstimado.$lte = Number(ticketMax);
  }

  const total = await Lead.countDocuments(filter);
  const skip = (page - 1) * limit;
  const list = await Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  const data = list.map((o) => ({ ...o, id: String(o._id) }));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findByTelefono(telefono, excludeId = null) {
  const normalized = (telefono || '').trim();
  if (!normalized) return null;
  const filter = { telefono: normalized };
  if (excludeId) filter._id = { $ne: excludeId };
  const doc = await Lead.findOne(filter).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function findByEmail(email, excludeId = null) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return null;
  const filter = { email: normalized };
  if (excludeId) filter._id = { $ne: excludeId };
  const doc = await Lead.findOne(filter).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function create(data) {
  const doc = await Lead.create({
    nombre: data.nombre,
    empresa: data.empresa,
    telefono: data.telefono,
    email: data.email || '',
    canalOrigen: data.canalOrigen,
    estadoPipeline: data.estadoPipeline,
    ticketEstimado: data.ticketEstimado,
    prioridad: data.prioridad,
    localidad: data.localidad ?? '',
    notas: data.notas ?? '',
    activo: data.activo !== undefined ? data.activo : true,
    fechaAlta: data.fechaAlta || new Date(),
    ultimoContacto: data.ultimoContacto ?? null,
    clienteId: data.clienteId ?? null,
  });
  return toDoc(doc);
}

async function update(id, data) {
  const { id: _unused, ...setData } = data;
  const doc = await Lead.findByIdAndUpdate(id, { $set: setData }, { new: true }).lean();
  return doc ? { ...doc, id: String(doc._id) } : null;
}

async function updateUltimoContacto(id, fecha) {
  return update(id, { ultimoContacto: fecha });
}

async function remove(id) {
  const result = await Lead.findByIdAndDelete(id);
  return !!result;
}

module.exports = {
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
