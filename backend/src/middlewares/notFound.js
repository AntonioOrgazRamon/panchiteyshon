const { error } = require('../utils/response');

function notFound(req, res) {
  return error(res, 'Ruta no encontrada', 404);
}

module.exports = notFound;
