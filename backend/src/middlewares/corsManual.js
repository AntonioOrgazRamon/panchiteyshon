/**
 * Middleware CORS manual: establece los headers en TODAS las respuestas.
 * Útil cuando un proxy (Hostinger, Nginx, etc.) puede no reenviar los headers del paquete cors.
 */
const ALLOWED_ORIGINS = [
  'https://angularbertha.nakedcode.es',
  'https://reactbertha.nakedcode.es',
  'http://localhost:4200',
  'http://localhost:5173',
];

function corsManual(req, res, next) {
  const origin = req.get('Origin');
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}

module.exports = corsManual;
