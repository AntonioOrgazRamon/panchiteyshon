const { v4: uuidv4 } = require('uuid');
const { TIPOS, DIRECCIONES, RESULTADOS } = require('../models/interaccion.model');

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(d, days) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

const resumenes = [
  'Llamada inicial, dejó mensaje.',
  'Respondió por WhatsApp, pide presupuesto.',
  'Reunión de presentación, muy interesado.',
  'Envió email con requisitos.',
  'No contestó, reintentar en una semana.',
  'Pidió tiempo para decidir.',
  'Cierre positivo, enviar propuesta formal.',
  'Llamada de seguimiento, todo bien.',
  'Reunión virtual, mostró interés en el producto.',
  'Envió consulta por formulario web.',
  'Referido por otro cliente.',
  'Solicitó demo técnica.',
  'Pidió ampliación de garantía.',
  'Negociación de precios en curso.',
  'Firmó contrato, activar servicio.',
  'Canceló reunión, reprogramar.',
  'No interesado por el momento.',
  'Competencia más barata, mantener contacto.',
];

function generateInteracciones(leadIds, count = 150) {
  const interacciones = [];
  if (!leadIds.length) return interacciones;

  for (let i = 0; i < count; i++) {
    const leadId = leadIds[i % leadIds.length];
    const fechaInteraccion = addDays(new Date(), -Math.floor(Math.random() * 90));
    const proximaAccion = Math.random() > 0.45 ? addDays(fechaInteraccion, 2 + Math.floor(Math.random() * 14)) : null;

    interacciones.push({
      id: uuidv4(),
      leadId,
      tipo: random(TIPOS),
      direccion: random(DIRECCIONES),
      resumen: random(resumenes),
      resultado: random(RESULTADOS),
      fechaInteraccion,
      proximaAccionFecha: proximaAccion,
      duracionMin: Math.random() > 0.5 ? 5 + Math.floor(Math.random() * 40) : null,
      createdAt: fechaInteraccion,
      updatedAt: new Date(),
    });
  }
  return interacciones;
}

module.exports = { generateInteracciones };
