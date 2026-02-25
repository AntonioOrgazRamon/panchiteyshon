/**
 * Definición del modelo Tarea.
 */
const TIPOS = ['seguimiento', 'reunion', 'interna', 'recordatorio'];
const ESTADOS = ['pendiente', 'en_progreso', 'hecha', 'cancelada'];
const PRIORIDADES = ['baja', 'media', 'alta'];
const CATEGORIA_PLANIFICACION = ['diaria', 'semanal', 'puntual'];
const REPETICION = ['none', 'daily', 'weekly'];

function createTarea(overrides = {}) {
  const now = new Date();
  return {
    id: overrides.id ?? null,
    titulo: overrides.titulo ?? '',
    descripcion: overrides.descripcion ?? '',
    tipo: overrides.tipo ?? 'seguimiento',
    estado: overrides.estado ?? 'pendiente',
    prioridad: overrides.prioridad ?? 'media',
    leadId: overrides.leadId ?? null,
    clienteId: overrides.clienteId ?? null,
    categoriaPlanificacion: overrides.categoriaPlanificacion ?? 'puntual',
    repeticion: overrides.repeticion ?? 'none',
    fechaProgramada: overrides.fechaProgramada ?? null,
    ordenManual: overrides.ordenManual ?? null,
    esHabitual: overrides.esHabitual ?? false,
    fechaVencimiento: overrides.fechaVencimiento ?? null,
    fechaRecordatorio: overrides.fechaRecordatorio ?? null,
    completada: overrides.completada ?? false,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

module.exports = {
  TIPOS,
  ESTADOS,
  PRIORIDADES,
  CATEGORIA_PLANIFICACION,
  REPETICION,
  createTarea,
};
