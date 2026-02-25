const { z } = require('zod');
const { TIPOS, ESTADOS, PRIORIDADES, CATEGORIA_PLANIFICACION, REPETICION } = require('../models/tarea.model');

const tareaBaseSchema = z.object({
  titulo: z.string().min(1, 'Título requerido').max(200),
  descripcion: z.string().max(2000).optional().default(''),
  tipo: z.enum(TIPOS),
  estado: z.enum(ESTADOS),
  prioridad: z.enum(PRIORIDADES),
  leadId: z.string().nullable().optional(),
  clienteId: z.string().nullable().optional(),
  categoriaPlanificacion: z.enum(CATEGORIA_PLANIFICACION).optional().default('puntual'),
  repeticion: z.enum(REPETICION).optional().default('none'),
  fechaProgramada: z.coerce.date().nullable().optional(),
  ordenManual: z.number().int().nullable().optional(),
  esHabitual: z.boolean().optional().default(false),
  fechaVencimiento: z.coerce.date().nullable().optional(),
  fechaRecordatorio: z.coerce.date().nullable().optional(),
  completada: z.boolean().optional().default(false),
});

const tareaSchema = tareaBaseSchema
  .refine((data) => !(data.leadId && data.clienteId), { message: 'Una tarea no puede tener leadId y clienteId a la vez.', path: ['leadId'] })
  .refine(
    (data) => {
      if (data.repeticion === 'none') return true;
      if (data.repeticion === 'daily') return data.categoriaPlanificacion === 'diaria';
      if (data.repeticion === 'weekly') return data.categoriaPlanificacion === 'semanal';
      return true;
    },
    { message: 'repeticion daily debe ir con categoriaPlanificacion diaria; weekly con semanal.', path: ['repeticion'] }
  );

const tareaPartialSchema = tareaBaseSchema.partial();

function validateTarea(body) {
  return tareaSchema.safeParse(body);
}

function validateTareaPartial(body) {
  return tareaPartialSchema.safeParse(body);
}

module.exports = { validateTarea, validateTareaPartial };
