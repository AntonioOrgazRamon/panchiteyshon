/**
 * Inserta en MongoDB 5 tareas con fecha de hoy (recordatorio y vencimiento)
 * para que el widget "Próximas tareas (hoy)" y el dashboard muestren datos.
 * Uso: node src/data/seed-today-mongo.js
 * Requiere: MONGO_URI en .env y mongoose instalado.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const Tarea = require('../models/Tarea.mongoose');
const Lead = require('../models/Lead.mongoose');

function todayAt(h, m = 0) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nakedcrm');
  let leadId = null;
  const lead = await Lead.findOne().lean();
  if (lead) leadId = lead._id;

  const titulos = [
    'Llamada de seguimiento',
    'Enviar oferta antes de mediodía',
    'Reunión con cliente',
    'Cerrar propuesta pendiente',
    'Recordatorio: enviar informe',
  ];
  const horas = [9, 11, 14, 17, 19];
  const prioridades = ['alta', 'media', 'baja', 'media', 'baja'];

  for (let i = 0; i < 5; i++) {
    const fechaCierre = todayAt(horas[i]);
    await Tarea.create({
      titulo: titulos[i],
      descripcion: 'Tarea de hoy (seed).',
      tipo: 'seguimiento',
      estado: 'pendiente',
      prioridad: prioridades[i],
      leadId,
      fechaVencimiento: fechaCierre,
      fechaRecordatorio: todayAt(horas[i] - 1),
      completada: false,
    });
  }

  console.log('Creadas 5 tareas de hoy en MongoDB.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
