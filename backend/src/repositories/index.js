const { config } = require('../config');

let leadRepository;
let interaccionRepository;
let tareaRepository;
let clienteRepository;
let actualProvider;

if (config.dataProvider === 'mongo') {
  try {
    leadRepository = require('./lead.repository.mongo');
    interaccionRepository = require('./interaccion.repository.mongo');
    tareaRepository = require('./tarea.repository.mongo');
    clienteRepository = require('./cliente.repository.mongo');
    actualProvider = 'mongo';
  } catch (e) {
    console.warn('[REPOS] Mongo no disponible, usando memoria:', e.message);
    leadRepository = require('./lead.repository.memory');
    interaccionRepository = require('./interaccion.repository.memory');
    tareaRepository = require('./tarea.repository.memory');
    clienteRepository = require('./cliente.repository.memory');
    actualProvider = 'memory';
  }
} else {
  leadRepository = require('./lead.repository.memory');
  interaccionRepository = require('./interaccion.repository.memory');
  tareaRepository = require('./tarea.repository.memory');
  clienteRepository = require('./cliente.repository.memory');
  actualProvider = 'memory';
}

console.log('[REPOS] Proveedor de datos activo:', actualProvider);

module.exports = {
  leadRepository,
  interaccionRepository,
  tareaRepository,
  clienteRepository,
};
