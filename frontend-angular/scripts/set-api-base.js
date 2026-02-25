/**
 * Prebuild: si API_BASE_URL o VITE_API_URL está definida, escribe esa URL en environment.prod.ts.
 * Uso (misma idea que React): API_BASE_URL=https://tu-api.com/api/v1 npm run build
 */
const fs = require('fs');
const path = require('path');

const apiBase = process.env.API_BASE_URL || process.env.VITE_API_URL;
const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

if (!apiBase) {
  console.log('Angular build: API_BASE_URL no definida, se usa apiBase por defecto en environment.prod.ts');
  process.exit(0);
  return;
}

let content = fs.readFileSync(envPath, 'utf8');
// Reemplazar la línea apiBase: '...' por apiBase: '<apiBase>'
// Escapar comillas simples en la URL por si acaso
const value = apiBase.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
content = content.replace(/apiBase:\s*['"][^'"]*['"]/, `apiBase: '${value}'`);
fs.writeFileSync(envPath, content);
console.log('Angular build: apiBase fijada desde API_BASE_URL/VITE_API_URL');
