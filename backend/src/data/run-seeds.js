const { generateLeads } = require('./leads.seed');
const { generateInteracciones } = require('./interacciones.seed');
const { generateTareas } = require('./tareas.seed');
const { generateClientes } = require('./clientes.seed');

// Muchos datos: leads repartidos en todos los estados, clientes, tareas (hoy + vencidas + futuras), interacciones
const leads = generateLeads(90);
const leadIds = leads.map((l) => l.id);
const clientes = generateClientes(leadIds);
const clienteIds = clientes.map((c) => c.id);
const interacciones = generateInteracciones(leadIds, 150);
const tareas = generateTareas(leadIds, 75, clienteIds);

module.exports = {
  seedLeads: () => [...leads],
  seedInteracciones: () => [...interacciones],
  seedTareas: () => [...tareas],
  seedClientes: () => [...clientes],
};
