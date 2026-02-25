const mongoose = require('mongoose');

const TIPOS = ['llamada', 'whatsapp', 'email', 'reunion', 'nota'];
const DIRECCIONES = ['saliente', 'entrante'];
const RESULTADOS = ['sin_respuesta', 'respondio', 'interesado', 'no_interesa', 'pendiente'];

const interaccionSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    tipo: { type: String, enum: TIPOS, default: 'nota' },
    direccion: { type: String, enum: DIRECCIONES, default: 'saliente' },
    resumen: { type: String, required: true, maxlength: 2000 },
    resultado: { type: String, enum: RESULTADOS, default: 'pendiente' },
    fechaInteraccion: { type: Date, required: true },
    proximaAccionFecha: { type: Date, default: null },
    duracionMin: { type: Number, min: 0, default: null },
  },
  { timestamps: true }
);

interaccionSchema.index({ leadId: 1 });
interaccionSchema.index({ fechaInteraccion: -1 });
interaccionSchema.index({ tipo: 1 });

const Interaccion = mongoose.model('Interaccion', interaccionSchema);
module.exports = Interaccion;
