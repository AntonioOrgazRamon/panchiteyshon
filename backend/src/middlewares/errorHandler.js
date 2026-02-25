const { config } = require('../config');
const { error } = require('../utils/response');

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.statusCode || err.status || 500;
  const message = status === 500 && config.nodeEnv === 'production'
    ? 'Error interno del servidor'
    : (err.message || 'Error interno del servidor');
  if (status === 500) console.error(err);
  return error(res, message, status, err.errors || undefined);
}

module.exports = errorHandler;
