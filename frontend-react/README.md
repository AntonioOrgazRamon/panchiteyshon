# NakedCRM Lite — Frontend React

SPA React (Vite) que consume la misma API que el frontend Angular.

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:3000`

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre **http://localhost:5173**. El proxy de Vite redirige `/api` al backend.

## Estructura

- `src/services/` — api (axios), leadService, interaccionService, tareaService, dashboardService.
- `src/components/` — Loader, AlertMessage.
- `src/pages/` — DashboardPage, LeadsListPage, LeadFormPage, LeadDetailPage, InteraccionesListPage, InteraccionFormPage, TareasListPage, TareaFormPage.
- `src/App.tsx` — Navbar y rutas (React Router).

## Build

```bash
npm run build
```

Salida en `dist/`.
