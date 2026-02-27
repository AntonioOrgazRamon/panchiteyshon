# NakedCRM Lite

**Gestión de Leads, Tareas y Seguimientos para Negocio Digital**

---

## Objetivo

Sistema CRM ligero para gestionar **leads** (potenciales clientes), **seguimientos** (interacciones por WhatsApp, email, llamadas, reuniones) y **tareas/recordatorios**, con vista del pipeline de ventas y métricas básicas de actividad y conversión.

## Problema que resuelve

- Centralizar leads y su estado en el pipeline.
- Registrar interacciones (canal, resultado, próxima acción).
- Gestionar tareas y recordatorios ligados o no a leads.
- Consultar métricas: total leads, activos, interacciones recientes, tareas pendientes/vencidas, tasa de conversión.

## Tecnologías

| Capa | Stack |
|------|--------|
| Backend | Node.js, Express, Zod (validación), proveedor in-memory / MongoDB (fase final) |
| Frontend 1 | Angular 17+, Bootstrap 5, Reactive Forms |
| Frontend 2 | React 18, Vite, React Router, Axios, Bootstrap 5 |
| API | REST, JSON, convención `/api/v1` |

## Arquitectura

```
/project-root
  /backend          → API REST (Express, capas: config, models, validators, repositories, services, controllers, routes)
  /frontend-angular → SPA Angular (Dashboard, Leads, Interacciones, Tareas)
  /frontend-react   → SPA React (mismas pantallas, misma API)
```

Ambos frontends consumen **la misma API**; no se modifica la API para cada uno.

## Entidades y campos

### Lead
- id, nombre, empresa, telefono, email, canalOrigen, estadoPipeline, ticketEstimado, prioridad, localidad, notas, activo, fechaAlta, ultimoContacto, createdAt, updatedAt.
- **Enums:** canalOrigen (whatsapp, instagram, llamada, web, referido, otro), estadoPipeline (nuevo, contactado, interesado, reunion, propuesta, cerrado, perdido), prioridad (baja, media, alta).

### Interaccion
- id, leadId, tipo, direccion, resumen, resultado, fechaInteraccion, proximaAccionFecha, duracionMin, createdAt, updatedAt.
- **Enums:** tipo (llamada, whatsapp, email, reunion, nota), direccion (saliente, entrante), resultado (sin_respuesta, respondio, interesado, no_interesa, pendiente).

### Tarea
- id, titulo, descripcion, tipo, estado, prioridad, leadId (opcional), fechaVencimiento, fechaRecordatorio, completada, createdAt, updatedAt.
- **Enums:** tipo (seguimiento, reunion, interna, recordatorio), estado (pendiente, en_progreso, hecha, cancelada), prioridad (baja, media, alta).

---

## Reglas de negocio (8)

1. **Lead:** No permitir duplicados por mismo teléfono o mismo email (si existe).
2. **Lead:** Ticket estimado ≥ 0.
3. **Lead:** No se puede tener estado cerrado/perdido con activo = true; al pasar a cerrado/perdido se marca activo = false.
4. **Lead:** Al crear una interacción de un lead, se actualiza automáticamente `ultimoContacto` del lead.
5. **Lead:** Si estadoPipeline = propuesta, debe existir al menos una interacción previa (validación al crear/actualizar).
6. **Interacción:** `proximaAccionFecha` no puede ser anterior a `fechaInteraccion`.
7. **Interacción:** No permitir interacción para lead inexistente. Si resultado = interesado, se crea automáticamente una tarea de seguimiento.
8. **Tarea:** No permitir completada = true si estado no es hecha (se ajusta estado). `fechaRecordatorio` no puede ser posterior a `fechaVencimiento`. Si hay leadId, el lead debe existir.

---

## Endpoints (API v1)

Base: `http://localhost:3000/api/v1`  
En producción: `https://darkorchid-lapwing-635040.hostingersite.com/api/v1`

### Leads
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/leads/get/all` | Todos los leads |
| GET | `/leads/get/all/paginated` | Paginado (query: page, limit, search, estadoPipeline, prioridad, canalOrigen, fechaCreacionDesde, fechaCreacionHasta, ticketMin, ticketMax) |
| GET | `/leads/get/export/csv` | Exportar leads en CSV |
| GET | `/leads/get/:id` | Lead por ID |
| GET | `/leads/get/:id/interacciones` | Interacciones del lead |
| GET | `/leads/get/:id/tareas` | Tareas del lead |
| POST | `/leads/post` | Crear lead |
| PUT / PATCH | `/leads/update/:id` | Actualizar lead |
| DELETE | `/leads/delete/:id` | Eliminar lead |
| POST | `/leads/get/:id/convertir-cliente` | Convertir lead en cliente (body opcional: campos de cliente para sobrescribir) |

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/clientes/get/all` | Todos los clientes |
| GET | `/clientes/get/all/paginated` | Paginado (query: page, limit, search, estadoCliente, servicio, fechaAltaDesde, fechaAltaHasta, proximaRevisionDesde, proximaRevisionHasta) |
| GET | `/clientes/get/:id` | Cliente por ID |
| GET | `/clientes/get/:id/tareas` | Tareas asociadas al cliente |
| POST | `/clientes/post` | Crear cliente |
| PUT / PATCH | `/clientes/update/:id` | Actualizar cliente |
| DELETE | `/clientes/delete/:id` | Eliminar cliente |

### Interacciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/interacciones/get/all` | Todas |
| GET | `/interacciones/get/all/paginated` | Paginado (query: page, limit, leadId, tipo, resultado) |
| GET | `/interacciones/get/:id` | Por ID |
| POST | `/interacciones/post` | Crear |
| PUT / PATCH | `/interacciones/update/:id` | Actualizar |
| DELETE | `/interacciones/delete/:id` | Eliminar |

### Tareas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tareas/get/all` | Todas |
| GET | `/tareas/get/all/paginated` | Paginado (query: page, limit, estado, prioridad, leadId, clienteId) |
| GET | `/tareas/get/upcoming` | Próximas (query: days=7) |
| GET | `/tareas/get/today` | Tareas de hoy (recordatorio o vencimiento = hoy) |
| GET | `/tareas/get/:id` | Por ID |
| POST | `/tareas/post` | Crear |
| PUT / PATCH | `/tareas/update/:id` | Actualizar |
| DELETE | `/tareas/delete/:id` | Eliminar |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard/summary` | Resumen (totalLeads, leadsActivos, clientesActivos, tareasPendientes, tareasVencidas, reunionesSemana, actividadReciente, tareasHoy, proximasTareas) |

### Salud y documentación
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado de la API: ok, message, provider (memory \| mongo) |
| GET | `/documentacion` o `/Documentacion` | Documentación completa en JSON: todos los endpoints, parámetros, ejemplos y comandos **curl** de prueba |

---

## Cómo ejecutar

### Requisitos
- Node.js 18+
- (Opcional, fase final) MongoDB

### 1. Backend
```bash
cd backend
npm install
# Crear .env a partir de .env.example (opcional; por defecto usa memoria)
npm run dev
```
Servidor en **http://localhost:3000**. Por defecto `DATA_PROVIDER=memory`.

### 2. Frontend Angular
```bash
cd frontend-angular
npm install
npm start
```
App en **http://localhost:4200**. El proxy envía `/api` al backend 3000.

### 3. Frontend React
```bash
cd frontend-react
npm install
npm run dev
```
App en **http://localhost:5173**. Vite proxy envía `/api` al backend 3000.

### Variables de entorno (backend)
En `backend` copiar `.env.example` a `.env`:
- `PORT` — puerto (default 3000)
- `NODE_ENV` — development | production
- `DATA_PROVIDER` — **memory** (actual) | **mongo** (fase final)
- `CORS_ORIGIN` — orígenes permitidos (default 4200, 5173)
- `MONGO_URI` — solo cuando `DATA_PROVIDER=mongo`

---

## Fase actual: provider memory

El backend arranca con **datos en memoria** (seeds: 20 leads, 40 interacciones, 20 tareas). No se usa base de datos real. Ideal para desarrollo y entrega inicial del proyecto integrador.

---

## Cómo activar MongoDB (fase final)

1. Tener MongoDB en ejecución (local o Atlas).
2. En `backend/.env`: `DATA_PROVIDER=mongo` y `MONGO_URI=mongodb://localhost:27017/nakedcrm` (o tu URI).
3. Instalar Mongoose: `cd backend && npm install mongoose`.
4. Los repositorios `*.repository.mongo.js` y modelos `*.mongoose.js` están en `backend/src`; la factory en `repositories/index.js` elige según `DATA_PROVIDER`.
5. Al arrancar, el servidor conecta a MongoDB y usa los repos Mongo; los frontends y la API no cambian.

Opcional: script de seed para Mongo (insertar datos iniciales en la BD real); por ahora los datos se cargan solo en memoria.

---

## Despliegue (producción)

| Recurso | URL |
|---------|-----|
| **API** | https://darkorchid-lapwing-635040.hostingersite.com |
| **Frontend Angular** | https://angularbertha.nakedcode.es |
| **Frontend React** | https://reactbertha.nakedcode.es |

Base de la API: `https://darkorchid-lapwing-635040.hostingersite.com/api/v1`

---

## Capturas

*(Añadir aquí 2–3 capturas: por ejemplo Dashboard, listado de Leads y formulario de Lead o vista detalle, para el entregable.)*

---

## Cumplimiento de requisitos académicos

| Requisito | Estado |
|-----------|--------|
| CRUD completo (Leads, Interacciones, Tareas) | ✔ |
| Validaciones (backend Zod + frontend) | ✔ |
| Lógica de negocio (8 reglas) | ✔ |
| Paginación y filtros | ✔ |
| Frontend Angular (componentes, servicios, formularios reactivos, Bootstrap) | ✔ |
| Frontend React (componentes funcionales, hooks, Router, Bootstrap) | ✔ |
| Bootstrap en ambos frontends | ✔ |
| Documentación (README, endpoints, reglas) | ✔ |
| Estructura por capas en backend | ✔ |
| CORS, manejo de errores, códigos HTTP | ✔ |
| Preparado para MongoDB (repos, factory) | ✔ |

---

## Mejoras futuras

- Filtro por rango de fechas en listados.
- Métricas por periodo (mes/trimestre/año).
- Autenticación y permisos.
- Pruebas unitarias e integración.
