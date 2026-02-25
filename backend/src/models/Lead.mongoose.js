const mongoose = require('mongoose');

const ESTADOS_PIPELINE = ['nuevo', 'contactado', 'interesado', 'reunion', 'propuesta', 'cerrado', 'perdido'];
const CANALES_ORIGEN = ['whatsapp', 'instagram', 'llamada', 'web', 'referido', 'otro'];
const PRIORIDADES = ['baja', 'media', 'alta'];

const leadSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, maxlength: 200 },
    empresa: { type: String, required: true, maxlength: 200 },
    telefono: { type: String, required: true, maxlength: 50 },
    email: { type: String, maxlength: 200 },
    canalOrigen: { type: String, enum: CANALES_ORIGEN, default: 'otro' },
    estadoPipeline: { type: String, enum: ESTADOS_PIPELINE, default: 'nuevo' },
    ticketEstimado: { type: Number, min: 0, default: 0 },
    prioridad: { type: String, enum: PRIORIDADES, default: 'media' },
    localidad: { type: String, maxlength: 200, default: '' },
    notas: { type: String, maxlength: 2000, default: '' },
    activo: { type: Boolean, default: true },
    fechaAlta: { type: Date, default: Date.now },
    ultimoContacto: { type: Date, default: null },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  },
  { timestamps: true }
);

leadSchema.index({ telefono: 1 }, { unique: true });
leadSchema.index({ email: 1 }, { unique: true, sparse: true });
leadSchema.index({ estadoPipeline: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
