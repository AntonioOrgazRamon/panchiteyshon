const { z } = require('zod');
const { ESTADOS_PIPELINE, CANALES_ORIGEN, PRIORIDADES } = require('../models/lead.model');

const leadSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(200),
  empresa: z.string().min(1, 'Empresa requerida').max(200),
  telefono: z.string().min(1, 'Teléfono requerido').max(50),
  email: z.union([z.string().email('Email inválido'), z.literal('')]).optional().default(''),
  canalOrigen: z.enum(CANALES_ORIGEN),
  estadoPipeline: z.enum(ESTADOS_PIPELINE),
  ticketEstimado: z.number().min(0, 'Ticket estimado no puede ser negativo'),
  prioridad: z.enum(PRIORIDADES),
  localidad: z.string().max(200).optional().default(''),
  notas: z.string().max(2000).optional().default(''),
  activo: z.boolean().optional().default(true),
  fechaAlta: z.coerce.date().optional(),
  ultimoContacto: z.coerce.date().nullable().optional(),
});

const leadPartialSchema = leadSchema.partial();

function validateLead(body) {
  return leadSchema.safeParse(body);
}

function validateLeadPartial(body) {
  return leadPartialSchema.safeParse(body);
}

module.exports = { validateLead, validateLeadPartial };
