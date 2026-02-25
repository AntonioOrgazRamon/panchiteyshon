/**
 * Respuestas API unificadas.
 */
function success(res, data, message = 'OK', status = 200, meta = null) {
  const payload = { ok: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

function created(res, data, message = 'Creado correctamente') {
  return success(res, data, message, 201);
}

function error(res, message, status = 400, errors = null) {
  const payload = { ok: false, message };
  if (errors && errors.length) payload.errors = errors;
  return res.status(status).json(payload);
}

function validationErrors(res, zodError) {
  const errors = zodError.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return error(res, 'Error de validación', 400, errors);
}

module.exports = { success, created, error, validationErrors };
