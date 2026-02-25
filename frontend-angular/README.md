# NakedCRM Lite — Frontend Angular

SPA Angular que consume la API del backend.

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:3000`

## Instalación y ejecución

```bash
npm install
npm start
```

Abre **http://localhost:4200**. El proxy (`proxy.conf.json`) redirige `/api` al backend.

## Estructura

- `src/app/core/` — ApiService (HTTP base).
- `src/app/services/` — lead, interaccion, tarea, dashboard.
- `src/app/shared/` — Loader, Alert.
- `src/app/features/` — dashboard, leads (list, form, detail), interacciones (list, form), tareas (list, form).
- `src/app/app.routes.ts` — Rutas (dashboard, leads, interacciones, tareas).

## Build

```bash
npm run build
```

Salida en `dist/nakedcrm-lite-angular`.
