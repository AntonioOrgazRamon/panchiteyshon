/**
 * Definición del modelo Lead (compartida entre memory y Mongo).
 * En memoria se usa como DTO; en Mongo se refleja en Mongoose.
 */
const ESTADOS_PIPELINE = [
  'nuevo', 'contactado', 'interesado', 'reunion', 'propuesta', 'cerrado', 'perdido',
];
const CANALES_ORIGEN = [
  'whatsapp', 'instagram', 'llamada', 'web', 'referido', 'otro',
];
const PRIORIDADES = ['baja', 'media', 'alta'];

function createLead(overrides = {}) {
  const now = new Date();
  return {
    id: overrides.id ?? null,
    nombre: overrides.nombre ?? '',
    empresa: overrides.empresa ?? '',
    telefono: overrides.telefono ?? '',
    email: overrides.email ?? '',
    canalOrigen: overrides.canalOrigen ?? 'otro',
    estadoPipeline: overrides.estadoPipeline ?? 'nuevo',
    ticketEstimado: overrides.ticketEstimado ?? 0,
    prioridad: overrides.prioridad ?? 'media',
    localidad: overrides.localidad ?? '',
    notas: overrides.notas ?? '',
    activo: overrides.activo !== undefined ? overrides.activo : true,
    fechaAlta: overrides.fechaAlta ?? now,
    ultimoContacto: overrides.ultimoContacto ?? null,
    clienteId: overrides.clienteId ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

module.exports = {
  ESTADOS_PIPELINE,
  CANALES_ORIGEN,
  PRIORIDADES,
  createLead,
};
