const { z } = require('zod');
const { ESTADOS_CLIENTE } = require('../models/cliente.model');

const clienteSchema = z
  .object({
    nombreContacto: z.string().min(1, 'Nombre de contacto requerido').max(200),
    empresa: z.string().min(1, 'Empresa requerida').max(200),
    telefono: z.string().min(1, 'Teléfono requerido').max(50),
    email: z.union([z.string().email('Email inválido'), z.literal('')]).optional().default(''),
    ciudad: z.string().max(200).optional().default(''),
    web: z.string().max(500).optional().default(''),
    estadoCliente: z.enum(ESTADOS_CLIENTE),
    serviciosContratados: z.array(z.string().max(200)).optional().default([]),
    mrr: z.number().min(0, 'MRR no puede ser negativo').nullable().optional(),
    fechaAlta: z.coerce.date().optional(),
    ultimaInteraccion: z.coerce.date().nullable().optional(),
    proximaRevision: z.coerce.date().nullable().optional(),
    observacionesInternas: z.string().max(5000).optional().default(''),
    leadOrigenId: z.string().nullable().optional(),
  })
  .strict();

const clientePartialSchema = clienteSchema.partial();

function validateCliente(body) {
  return clienteSchema.safeParse(body);
}

function validateClientePartial(body) {
  return clientePartialSchema.safeParse(body);
}

module.exports = { validateCliente, validateClientePartial };
