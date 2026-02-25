const { leadRepository, interaccionRepository, tareaRepository, clienteRepository } = require('../repositories');

/**
 * Construye timeline de actividad reciente mezclando leads, interacciones, tareas y clientes por fecha.
 */
function buildActividadReciente(leads, interacciones, tareas, clientes, limit = 20) {
  const eventos = [];

  leads.forEach((l) => {
    if (l.createdAt) eventos.push({ tipo: 'lead_creado', fecha: new Date(l.createdAt), entidadId: l.id, titulo: `Lead: ${l.nombre}`, meta: { estado: l.estadoPipeline } });
    if (l.updatedAt && l.updatedAt !== l.createdAt) eventos.push({ tipo: 'lead_actualizado', fecha: new Date(l.updatedAt), entidadId: l.id, titulo: `Lead actualizado: ${l.nombre}`, meta: {} });
  });
  interacciones.forEach((i) => {
    eventos.push({ tipo: 'interaccion_creada', fecha: new Date(i.fechaInteraccion || i.createdAt), entidadId: i.id, leadId: i.leadId, titulo: `Interacción con lead`, meta: { resultado: i.resultado } });
  });
  tareas.forEach((t) => {
    if (t.createdAt) eventos.push({ tipo: 'tarea_creada', fecha: new Date(t.createdAt), entidadId: t.id, titulo: t.titulo, meta: { estado: t.estado } });
    if (t.estado === 'hecha' && t.updatedAt) eventos.push({ tipo: 'tarea_completada', fecha: new Date(t.updatedAt), entidadId: t.id, titulo: t.titulo, meta: {} });
  });
  clientes.forEach((c) => {
    if (c.createdAt) eventos.push({ tipo: 'cliente_creado', fecha: new Date(c.createdAt), entidadId: c.id, titulo: `Cliente: ${c.empresa}`, meta: {} });
    if (c.leadOrigenId) eventos.push({ tipo: 'lead_convertido_cliente', fecha: new Date(c.createdAt), entidadId: c.id, leadId: c.leadOrigenId, titulo: `Lead convertido en cliente: ${c.empresa}`, meta: {} });
  });

  eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  return eventos.slice(0, limit).map((e) => ({ ...e, fecha: e.fecha.toISOString() }));
}

async function getSummary(params = {}) {
  const { limitLeads = 10, limitTareas = 15, limitActividad = 20 } = params;
  const [leads, interacciones, tareas, clientes] = await Promise.all([
    leadRepository.findAll(),
    interaccionRepository.findAll(),
    tareaRepository.findAll(),
    clienteRepository.findAll(),
  ]);

  const totalLeads = leads.length;
  const leadsActivos = leads.filter((l) => l.activo).length;
  const leadsPorEstado = {};
  leads.forEach((l) => {
    leadsPorEstado[l.estadoPipeline] = (leadsPorEstado[l.estadoPipeline] || 0) + 1;
  });
  const leadsPorCanal = {};
  leads.forEach((l) => {
    leadsPorCanal[l.canalOrigen] = (leadsPorCanal[l.canalOrigen] || 0) + 1;
  });

  const clientesActivos = clientes.filter((c) => c.estadoCliente === 'activo').length;
  const conversionLeadCliente = totalLeads > 0
    ? Math.round((leads.filter((l) => l.clienteId).length / totalLeads) * 100) / 100
    : 0;

  const totalInteracciones = interacciones.length;
  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  const interaccionesUltimos30Dias = interacciones.filter(
    (i) => new Date(i.fechaInteraccion) >= hace30
  ).length;

  const tareasPendientes = tareas.filter(
    (t) => t.estado !== 'hecha' && t.estado !== 'cancelada'
  ).length;
  const ahora = new Date();
  const tareasVencidas = tareas.filter(
    (t) =>
      t.estado !== 'hecha' &&
      t.estado !== 'cancelada' &&
      t.fechaVencimiento &&
      new Date(t.fechaVencimiento) < ahora
  ).length;
  const tareasPorPrioridad = { baja: 0, media: 0, alta: 0 };
  tareas.forEach((t) => {
    if (tareasPorPrioridad[t.prioridad] !== undefined) tareasPorPrioridad[t.prioridad]++;
  });

  const tareasHoy = await tareaRepository.findToday();
  const tareasPendientesHoy = tareasHoy.length;

  const inicioSemana = new Date(ahora);
  inicioSemana.setHours(0, 0, 0, 0);
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(finSemana.getDate() + 7);
  const reunionesSemana = tareas.filter(
    (t) =>
      t.estado !== 'hecha' &&
      t.estado !== 'cancelada' &&
      t.tipo === 'reunion' &&
      t.fechaVencimiento &&
      new Date(t.fechaVencimiento) >= inicioSemana &&
      new Date(t.fechaVencimiento) <= finSemana
  ).length;

  const cerrados = (leadsPorEstado.cerrado || 0);
  const conversionRateBasica = totalLeads > 0 ? Math.round((cerrados / totalLeads) * 100) / 100 : 0;
  const sinRespuesta = interacciones.filter((i) => i.resultado === 'sin_respuesta').length;

  const leadsRecientes = [...leads]
    .filter((l) => l.activo)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, limitLeads);

  const proximasTareas = [...tareas]
    .filter((t) => t.estado !== 'hecha' && t.estado !== 'cancelada' && t.fechaVencimiento && new Date(t.fechaVencimiento) >= ahora)
    .sort((a, b) => new Date(a.fechaVencimiento || a.fechaProgramada) - new Date(b.fechaVencimiento || b.fechaProgramada))
    .slice(0, limitTareas);

  const actividadReciente = buildActividadReciente(leads, interacciones, tareas, clientes, limitActividad);

  return {
    totalLeads,
    leadsActivos,
    clientesActivos,
    tareasPendientes,
    tareasPendientesHoy,
    tareasVencidas,
    conversionLeadCliente,
    reunionesSemana,
    leadsPorEstado,
    leadsPorCanal,
    totalInteracciones,
    interaccionesUltimos30Dias,
    tareasPorPrioridad,
    conversionRateBasica,
    sinRespuesta,
    leadsRecientes,
    proximasTareas,
    tareasHoy,
    actividadReciente,
  };
}

module.exports = { getSummary, buildActividadReciente };
