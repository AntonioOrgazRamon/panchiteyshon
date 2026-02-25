const mongoose = require('mongoose');

const ESTADOS_CLIENTE = ['activo', 'pausado', 'finalizado'];

const clienteSchema = new mongoose.Schema(
  {
    nombreContacto: { type: String, required: true, maxlength: 200 },
    empresa: { type: String, required: true, maxlength: 200 },
    telefono: { type: String, required: true, maxlength: 50 },
    email: { type: String, maxlength: 200, default: '' },
    ciudad: { type: String, maxlength: 200, default: '' },
    web: { type: String, maxlength: 500, default: '' },
    estadoCliente: { type: String, enum: ESTADOS_CLIENTE, default: 'activo' },
    serviciosContratados: [{ type: String, maxlength: 200 }],
    mrr: { type: Number, min: 0, default: null },
    fechaAlta: { type: Date, default: Date.now },
    ultimaInteraccion: { type: Date, default: null },
    proximaRevision: { type: Date, default: null },
    observacionesInternas: { type: String, maxlength: 5000, default: '' },
    leadOrigenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
  },
  { timestamps: true }
);

clienteSchema.index({ email: 1 });
clienteSchema.index({ telefono: 1 });
clienteSchema.index({ estadoCliente: 1 });
clienteSchema.index({ leadOrigenId: 1 });
clienteSchema.index({ createdAt: -1 });
clienteSchema.index({ proximaRevision: 1 });

const Cliente = mongoose.model('Cliente', clienteSchema);
module.exports = Cliente;
