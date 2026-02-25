const { v4: uuidv4 } = require('uuid');
const { TIPOS, ESTADOS, PRIORIDADES, CATEGORIA_PLANIFICACION, REPETICION } = require('../models/tarea.model');

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(d, days) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function todayAt(h, m = 0) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

const titulosHoy = [
  'Llamada de seguimiento', 'Enviar oferta antes de mediodía', 'Reunión con cliente',
  'Cerrar propuesta pendiente', 'Recordatorio: enviar informe', 'Llamar a lead interesado',
  'Enviar catálogo actualizado', 'Coordinar demo técnica', 'Seguimiento post-reunión',
];
const titulos = [
  'Llamar para seguimiento', 'Enviar propuesta por email', 'Reunión de cierre',
  'Recordatorio: enviar catálogo', 'Revisar contrato', 'Coordinar visita',
  'Enviar presupuesto actualizado', 'Llamada de recordatorio', 'Enviar documentación',
  'Confirmar reunión', 'Preparar presentación', 'Seguimiento post-llamada',
  'Enviar factura', 'Coordinar entrega', 'Reunión de kick-off',
];

function generateTareasHoy(leadIds, clienteIds = []) {
  const hoy = new Date();
  const tareas = [];
  const ids = [...leadIds];
  if (clienteIds.length) ids.push(...clienteIds);
  for (let i = 0; i < 9; i++) {
    const fechaCierre = todayAt(8 + (i % 6), (i % 3) * 20);
    tareas.push({
      id: uuidv4(),
      titulo: titulosHoy[i % titulosHoy.length],
      descripcion: 'Tarea de hoy (seed).',
      tipo: random(TIPOS),
      estado: i < 2 ? 'hecha' : 'pendiente',
      prioridad: i % 3 === 0 ? 'alta' : i % 3 === 1 ? 'media' : 'baja',
      leadId: leadIds[i % leadIds.length] || null,
      clienteId: null,
      categoriaPlanificacion: 'diaria',
      repeticion: 'daily',
      fechaProgramada: fechaCierre,
      ordenManual: i + 1,
      esHabitual: true,
      fechaVencimiento: fechaCierre,
      fechaRecordatorio: todayAt(7 + (i % 6), 0),
      completada: i < 2,
      createdAt: addDays(hoy, -1),
      updatedAt: hoy,
    });
  }
  return tareas;
}

function generateTareas(leadIds, count = 70, clienteIds = []) {
  const tareas = [];
  const allIds = leadIds.length ? leadIds : [];
  const useCliente = clienteIds.length > 0;

  const numRandom = Math.max(0, count - 9);
  for (let i = 0; i < numRandom; i++) {
    const fechaVenc = addDays(new Date(), -10 + Math.floor(Math.random() * 45));
    const recordatorio = Math.random() > 0.35 ? addDays(fechaVenc, -1) : null;
    const estado = random(ESTADOS);
    const completada = estado === 'hecha';
    const cat = random(CATEGORIA_PLANIFICACION);
    const rep = cat === 'diaria' ? 'daily' : cat === 'semanal' ? 'weekly' : 'none';
    const useLead = allIds.length && (Math.random() > 0.3 || !useCliente);
    const useClienteId = useCliente && !useLead && Math.random() > 0.5 ? clienteIds[i % clienteIds.length] : null;

    tareas.push({
      id: uuidv4(),
      titulo: titulos[i % titulos.length],
      descripcion: i % 2 === 0 ? 'Seguimiento post contacto.' : '',
      tipo: random(TIPOS),
      estado,
      prioridad: random(PRIORIDADES),
      leadId: useLead ? allIds[i % allIds.length] : null,
      clienteId: useClienteId,
      categoriaPlanificacion: cat,
      repeticion: rep,
      fechaProgramada: fechaVenc,
      ordenManual: null,
      esHabitual: rep !== 'none',
      fechaVencimiento: fechaVenc,
      fechaRecordatorio: recordatorio,
      completada,
      createdAt: addDays(fechaVenc, -14),
      updatedAt: new Date(),
    });
  }

  tareas.push(...generateTareasHoy(leadIds, clienteIds));
  return tareas;
}

module.exports = { generateTareas, generateTareasHoy };
