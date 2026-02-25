# URLs de todos los endpoints (probar en navegador o Postman)

**Base:** `http://localhost:3000/api/v1`  
(Si el backend está en otro host, cambia `localhost:3000` por tu URL.)

---

## Salud y documentación

| Qué | URL (GET) |
|-----|-----------|
| Estado de la API | http://localhost:3000/api/v1/health |
| **Documentación completa (JSON)** | http://localhost:3000/api/v1/documentacion |

---

## Tareas (todas y más)

| Qué | URL |
|-----|-----|
| **Todas las tareas** | http://localhost:3000/api/v1/tareas/get/all |
| Tareas paginadas (filtros: estado, prioridad, leadId, clienteId, categoriaPlanificacion) | http://localhost:3000/api/v1/tareas/get/all/paginated?page=1&limit=10 |
| Próximas tareas (7 días) | http://localhost:3000/api/v1/tareas/get/upcoming?days=7 |
| Tareas de hoy | http://localhost:3000/api/v1/tareas/get/today |
| Una tarea por ID | http://localhost:3000/api/v1/tareas/get/REEMPLAZA_POR_ID |

---

## Leads

| Qué | URL |
|-----|-----|
| **Todos los leads** | http://localhost:3000/api/v1/leads/get/all |
| Leads paginados (filtros: estado, prioridad, canal, fechaCreacion, ultimoContacto, ticketMin/Max) | http://localhost:3000/api/v1/leads/get/all/paginated?page=1&limit=10 |
| Exportar leads CSV | http://localhost:3000/api/v1/leads/get/export/csv |
| Lead por ID | http://localhost:3000/api/v1/leads/get/REEMPLAZA_POR_ID |
| Interacciones de un lead | http://localhost:3000/api/v1/leads/get/REEMPLAZA_POR_ID/interacciones |
| Tareas de un lead | http://localhost:3000/api/v1/leads/get/REEMPLAZA_POR_ID/tareas |
| **Convertir lead en cliente** (POST) | http://localhost:3000/api/v1/leads/get/REEMPLAZA_LEAD_ID/convertir-cliente |

---

## Clientes

| Qué | URL |
|-----|-----|
| **Todos los clientes** | http://localhost:3000/api/v1/clientes/get/all |
| Clientes paginados (filtros: estadoCliente, servicio, fechaAlta, proximaRevision) | http://localhost:3000/api/v1/clientes/get/all/paginated?page=1&limit=10 |
| Cliente por ID | http://localhost:3000/api/v1/clientes/get/REEMPLAZA_POR_ID |
| Tareas del cliente | http://localhost:3000/api/v1/clientes/get/REEMPLAZA_CLIENTE_ID/tareas |

---

## Interacciones

| Qué | URL |
|-----|-----|
| **Todas las interacciones** | http://localhost:3000/api/v1/interacciones/get/all |
| Interacciones paginadas | http://localhost:3000/api/v1/interacciones/get/all/paginated?page=1&limit=10 |
| Interacción por ID | http://localhost:3000/api/v1/interacciones/get/REEMPLAZA_POR_ID |

---

## Dashboard

| Qué | URL |
|-----|-----|
| Resumen (KPIs, leadsRecientes, proximasTareas, tareasHoy, actividadReciente) | http://localhost:3000/api/v1/dashboard/summary |
| Con límites (opcional) | http://localhost:3000/api/v1/dashboard/summary?limitLeads=10&limitTareas=15&limitActividad=20 |

---

## Cómo probar

1. **En el navegador:** pega la URL en la barra (solo sirven los GET).
2. **Documentación:** abre `http://localhost:3000/api/v1/documentacion` y tendrás todo en JSON, con ejemplos de **curl** por endpoint.
3. **Por ID:** obtén un ID desde `/tareas/get/all` o `/leads/get/all` y sustituye `REEMPLAZA_POR_ID` en la ruta.
