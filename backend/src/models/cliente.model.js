/**
 * Definición del modelo Cliente (compartida entre memory y Mongo).
 */
const ESTADOS_CLIENTE = ['activo', 'pausado', 'finalizado'];

function createCliente(overrides = {}) {
  const now = new Date();
  return {
    id: overrides.id ?? null,
    nombreContacto: overrides.nombreContacto ?? '',
    empresa: overrides.empresa ?? '',
    telefono: overrides.telefono ?? '',
    email: overrides.email ?? '',
    ciudad: overrides.ciudad ?? '',
    web: overrides.web ?? '',
    estadoCliente: overrides.estadoCliente ?? 'activo',
    serviciosContratados: Array.isArray(overrides.serviciosContratados) ? overrides.serviciosContratados : [],
    mrr: overrides.mrr != null ? Number(overrides.mrr) : null,
    fechaAlta: overrides.fechaAlta ?? now,
    ultimaInteraccion: overrides.ultimaInteraccion ?? null,
    proximaRevision: overrides.proximaRevision ?? null,
    observacionesInternas: overrides.observacionesInternas ?? '',
    leadOrigenId: overrides.leadOrigenId ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

module.exports = {
  ESTADOS_CLIENTE,
  createCliente,
};
