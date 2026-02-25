/**
 * Producción: apiBase se puede fijar en build con API_BASE_URL o VITE_API_URL (igual que React).
 * Ej: API_BASE_URL=https://tu-api.com/api/v1 npm run build
 * Si no, se usa '/api/v1' (mismo origen con proxy).
 */
export const environment = {
  production: true,
  apiBase: 'https://darkorchid-lapwing-635040.hostingersite.com/api/v1',
};
