/**
 * Definición del modelo Interaccion.
 */
const TIPOS = ['llamada', 'whatsapp', 'email', 'reunion', 'nota'];
const DIRECCIONES = ['saliente', 'entrante'];
const RESULTADOS = ['sin_respuesta', 'respondio', 'interesado', 'no_interesa', 'pendiente'];

function createInteraccion(overrides = {}) {
  const now = new Date();
  return {
    id: overrides.id ?? null,
    leadId: overrides.leadId ?? null,
    tipo: overrides.tipo ?? 'nota',
    direccion: overrides.direccion ?? 'saliente',
    resumen: overrides.resumen ?? '',
    resultado: overrides.resultado ?? 'pendiente',
    fechaInteraccion: overrides.fechaInteraccion ?? now,
    proximaAccionFecha: overrides.proximaAccionFecha ?? null,
    duracionMin: overrides.duracionMin ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

module.exports = {
  TIPOS,
  DIRECCIONES,
  RESULTADOS,
  createInteraccion,
};
