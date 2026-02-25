/**
 * Configuración centralizada del backend.
 * Cargamos .env desde la carpeta backend (no desde cwd) para que funcione
 * aunque el servidor se arranque desde otra ruta.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PRODUCTION_ORIGINS = [
  'https://angularbertha.nakedcode.es',
  'https://reactbertha.nakedcode.es',
];

const defaultCors =
  process.env.NODE_ENV === 'production'
    ? PRODUCTION_ORIGINS.join(',')
    : 'http://localhost:4200,http://localhost:5173';

function parseCorsOrigin(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((o) => o.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

const envCors = parseCorsOrigin(process.env.CORS_ORIGIN || defaultCors);
const allowedOrigins = [...new Set([...PRODUCTION_ORIGINS, ...envCors])];

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dataProvider: process.env.DATA_PROVIDER || 'memory',
  corsOrigin: process.env.CORS_ORIGIN || defaultCors,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/nakedcrm',
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (PRODUCTION_ORIGINS.some((o) => origin === o)) return callback(null, true);
    callback(null, false);
  },
  optionsSuccessStatus: 200,
  credentials: false,
};

module.exports = { config, corsOptions };
