const { z } = require('zod');
const { TIPOS, DIRECCIONES, RESULTADOS } = require('../models/interaccion.model');

const interaccionSchema = z.object({
  leadId: z.string().min(1, 'leadId requerido'),
  tipo: z.enum(TIPOS),
  direccion: z.enum(DIRECCIONES),
  resumen: z.string().min(1, 'Resumen requerido').max(2000),
  resultado: z.enum(RESULTADOS),
  fechaInteraccion: z.coerce.date(),
  proximaAccionFecha: z.coerce.date().nullable().optional(),
  duracionMin: z.number().min(0).optional().nullable(),
});

const interaccionPartialSchema = interaccionSchema.partial();

function validateInteraccion(body) {
  return interaccionSchema.safeParse(body);
}

function validateInteraccionPartial(body) {
  return interaccionPartialSchema.safeParse(body);
}

module.exports = { validateInteraccion, validateInteraccionPartial };
