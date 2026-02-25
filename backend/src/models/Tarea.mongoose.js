const mongoose = require('mongoose');

const TIPOS = ['seguimiento', 'reunion', 'interna', 'recordatorio'];
const ESTADOS = ['pendiente', 'en_progreso', 'hecha', 'cancelada'];
const PRIORIDADES = ['baja', 'media', 'alta'];
const CATEGORIA_PLANIFICACION = ['diaria', 'semanal', 'puntual'];
const REPETICION = ['none', 'daily', 'weekly'];

const tareaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, maxlength: 200 },
    descripcion: { type: String, maxlength: 2000, default: '' },
    tipo: { type: String, enum: TIPOS, default: 'seguimiento' },
    estado: { type: String, enum: ESTADOS, default: 'pendiente' },
    prioridad: { type: String, enum: PRIORIDADES, default: 'media' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
    categoriaPlanificacion: { type: String, enum: CATEGORIA_PLANIFICACION, default: 'puntual' },
    repeticion: { type: String, enum: REPETICION, default: 'none' },
    fechaProgramada: { type: Date, default: null },
    ordenManual: { type: Number, default: null },
    esHabitual: { type: Boolean, default: false },
    fechaVencimiento: { type: Date, default: null },
    fechaRecordatorio: { type: Date, default: null },
    completada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

tareaSchema.index({ leadId: 1 });
tareaSchema.index({ estado: 1 });
tareaSchema.index({ fechaVencimiento: 1 });

const Tarea = mongoose.model('Tarea', tareaSchema);
module.exports = Tarea;
