# NakedCRM Lite — Backend

API REST para gestión de leads, interacciones y tareas.

## Estructura

```
src/
  config/         → Configuración (puerto, CORS, DATA_PROVIDER)
  models/         → Definiciones Lead, Interaccion, Tarea (compartidas)
  validators/     → Validación con Zod (lead, interaccion, tarea)
  repositories/   → Acceso a datos: *.repository.memory.js (actual) y *.repository.mongo.js (fase final)
  services/       → Lógica de negocio (reglas, validaciones de negocio)
  controllers/    → Request/response HTTP
  routes/         → Rutas Express
  middlewares/    → errorHandler, notFound, requestLogger
  data/           → Seeds (leads, interacciones, tareas) para memoria
  utils/          → Respuestas API unificadas (success, error, validationErrors)
  app.js          → Express app, rutas, middlewares
  server.js       → Arranque del servidor
```

## Scripts

- `npm start` — Arranca el servidor.
- `npm run dev` — Arranque con `--watch` para desarrollo.
- `npm run seed` — (Opcional) Ejecuta seeds; en memoria los datos se cargan al iniciar vía repos.

## Variables de entorno

Ver `.env.example`. Destacadas:
- `DATA_PROVIDER=memory` (por defecto) o `mongo`
- `PORT=3000`
- `CORS_ORIGIN=http://localhost:4200,http://localhost:5173`

## Endpoints

Ver [README raíz](../README.md#endpoints-api-v1). Respuestas estándar:
- Éxito: `{ ok: true, message, data, meta? }`
- Error: `{ ok: false, message, errors? }`

Códigos: 200, 201, 400, 404, 409, 422, 500.

## Reglas de negocio

Implementadas en `services/` (lead.service, interaccion.service, tarea.service). Ver README raíz.
