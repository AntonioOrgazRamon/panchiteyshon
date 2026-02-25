# Despliegue a producción – NakedCRM Lite

## Carpetas que debes seleccionar / subir

### 1. Backend (API)

- **Carpeta:** `backend`
- **Qué incluir:** Todo el contenido de `backend` **excepto** `node_modules` (se instala en el servidor con `npm install --production`).
- **Qué no subir:** El archivo `.env` (contiene secretos). En el servidor crea un `.env` a partir de `.env.example` y rellena `DATA_PROVIDER`, `PORT` y, si usas Mongo, `MONGO_URI`.

### 2. Frontend Angular (si usas esta versión)

- **Carpeta a generar:** Después de `ng build` (o `npm run build`), la salida está en:
  - **Ruta:** `frontend-angular/dist/nakedcrm-lite-angular/browser`
- **Qué subir:** Todo el contenido de esa carpeta `browser` (HTML, JS, CSS, assets) al directorio público de tu servidor web (raíz del dominio o subcarpeta, ej. `/crm`).

### 3. Frontend React (si usas esta versión)

- **Carpeta a generar:** Después de `npm run build`, la salida está en:
  - **Ruta:** `frontend-react/dist`
- **Qué subir:** Todo el contenido de `frontend-react/dist` al directorio público de tu servidor web.

---

## Resumen rápido

| Qué desplegar | Carpeta a seleccionar / subir |
|--------------|-------------------------------|
| **API (Node)** | `backend` (sin `node_modules`, sin `.env`) |
| **Angular (estático)** | `frontend-angular/dist/nakedcrm-lite-angular/browser` (tras `ng build`) |
| **React (estático)** | `frontend-react/dist` (tras `npm run build`) |

---

## Pasos previos al subir

1. **Backend**
   - En el servidor: `cd backend && npm install --production`
   - Crear `.env` con `DATA_PROVIDER`, `PORT` y, si aplica, `MONGO_URI`
   - Arrancar: `node src/server.js` o `npm start` (o con PM2/systemd)

2. **Angular**
   - **URL del API en producción:** Si ves *"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"*, el front pide JSON pero recibe HTML (p. ej. el `index.html`). Usa la **misma URL del API que React**.
     - **Mismo dominio con proxy:** `cd frontend-angular && npm run build` (apiBase queda `/api/v1`) y configura el servidor para hacer proxy de `/api` al backend.
     - **API en otro dominio (como React):** Misma variable que React: `VITE_API_URL=https://tu-api.com/api/v1 npm run build` en `frontend-angular`. Así la URL queda fijada en el build y no depende de `config.json`.
   - Subir el contenido de `dist/nakedcrm-lite-angular/browser`

3. **React**
   - Si tu API en producción tiene otra URL: `VITE_API_URL=https://tu-api.com/api/v1 npm run build` en `frontend-react`
   - Local: `cd frontend-react && npm run build`
   - Subir el contenido de `dist`

4. **CORS y proxy**
   - Configura CORS en el backend con el dominio real de tu frontend.
   - O sirve API y frontend bajo el mismo dominio (reverse proxy) y usa rutas relativas (`/api/v1`); en ese caso no necesitas cambiar la URL en el frontend.
