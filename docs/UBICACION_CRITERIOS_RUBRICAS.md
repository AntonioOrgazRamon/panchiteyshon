# Ubicación de cada criterio de las rúbricas

Para cada criterio se indica **qué significa** (qué pide la rúbrica) y **dónde está** en el proyecto.

---

## 1. DOCUMENTACIÓN Y DESPLIEGUE (DAW)

### README (claridad)
**Qué significa:** Un README claro y estructurado que explique el proyecto: objetivo, tecnologías, cómo ejecutarlo y qué contiene (entidades, reglas, endpoints). La rúbrica valora que sea profesional y fácil de seguir.  
**Dónde está:** `README.md` (raíz del proyecto).

### Diagramas
**Qué significa:** Esquemas visuales del sistema: por ejemplo arquitectura (frontends + API + base de datos), flujo de capas del backend o relaciones entre entidades. Sirven para entender el proyecto de un vistazo.  
**Dónde está:** `docs/ARQUITECTURA.md` — diagramas en Mermaid (sistema, capas backend, entidades).

### Endpoints documentados
**Qué significa:** Listado de las rutas de la API (método, URL, descripción) para que cualquiera sepa qué endpoints existen y cómo usarlos. Puede ser en documento o vía una ruta de la API que devuelva esa información.  
**Dónde está:**  
• **Texto:** `README.md` (sección "Endpoints (API v1)") y `ENDPOINTS-URLS.md`.  
• **API viva (JSON + ejemplos curl):** `GET /api/v1/documentacion` o `GET /api/v1/Documentacion` — código en `backend/src/documentacion.js`.

### Reglas de negocio
**Qué significa:** Normas que debe cumplir la aplicación (ej.: “no duplicar leads por teléfono”, “si el lead está cerrado, activo = false”). Han de estar escritas y aplicadas en el código.  
**Dónde está:**  
• **Texto (las 8 reglas):** `README.md` — sección "Reglas de negocio (8)".  
• **Código:** `backend/src/services/lead.service.js`, `interaccion.service.js`, `tarea.service.js` y `backend/src/validators/*.validator.js`.

### Deploy Angular
**Qué significa:** Que la aplicación Angular esté publicada en un entorno accesible (URL) y que quede documentado cómo generar el build y qué carpeta/subir. El “deploy” es el resultado (la web en producción); el “build” es el comando que genera los archivos a subir.  
**Dónde está:**  
• **URL en producción:** https://angularbertha.nakedcode.es (`README.md`).  
• **Instrucciones:** `DEPLOY.md`.  
• **Build (carpeta a subir):** `frontend-angular/dist/nakedcrm-lite-angular/browser` — se genera con `cd frontend-angular && npm run build`.

### Deploy React
**Qué significa:** Lo mismo que Angular pero para la app React: aplicación en producción, documentación de cómo desplegar y carpeta que genera el build.  
**Dónde está:**  
• **URL en producción:** https://reactbertha.nakedcode.es (`README.md`).  
• **Instrucciones:** `DEPLOY.md`.  
• **Build (carpeta a subir):** `frontend-react/dist` — se genera con `cd frontend-react && npm run build`.

### Deploy API
**Qué significa:** Que el backend (Node/Express) esté desplegado en un servidor y accesible por URL, con instrucciones de qué subir (código, variables de entorno, comando de arranque).  
**Dónde está:**  
• **URL en producción:** https://darkorchid-lapwing-635040.hostingersite.com (`README.md`).  
• **Instrucciones:** `DEPLOY.md` — subir carpeta `backend` (sin `node_modules` ni `.env`), crear `.env` desde `.env.example`, `npm install --production`, arrancar con `node src/server.js`.

---

## 2. ANGULAR (50% DWEC)

### Servicios HTTP
**Qué significa:** Clases Angular que hacen las peticiones al backend (GET, POST, PUT, DELETE) de forma centralizada. Así los componentes no repiten la lógica de llamar a la API; la reutilizan. La rúbrica valora que estén bien organizados y sean reutilizables.  
**Dónde está:** `frontend-angular/src/app/core/api.service.ts` (servicio base) y `frontend-angular/src/app/services/lead.service.ts`, `interaccion.service.ts`, `tarea.service.ts`, `cliente.service.ts`, `dashboard.service.ts`.

### Formularios reactivos
**Qué significa:** Formularios construidos con **Reactive Forms** de Angular (FormBuilder, FormGroup, formControlName): el modelo del formulario vive en el componente y se enlaza a los campos. Se valora que los formularios sean funcionales y, en nivel alto, que tengan validaciones y feedback claro.  
**Dónde está:** `frontend-angular/src/app/features/leads/lead-form.component.ts`, `features/interacciones/interaccion-form.component.ts`, `features/tareas/tarea-form.component.ts`, `features/clientes/cliente-form.component.ts` (FormBuilder, FormGroup, ReactiveFormsModule).

### Validaciones
**Qué significa:** Comprobar que los datos son correctos antes de enviarlos (campos obligatorios, email válido, números mínimos, etc.) y mostrar mensajes al usuario cuando algo falla. Incluye validación en el frontend y uso de los errores que devuelve el backend.  
**Dónde está:** En los mismos formularios anteriores: `Validators.required`, `Validators.email`, `Validators.min(0)` y mensajes bajo cada campo cuando `invalid && touched`; además se muestran los `errors` que devuelve la API.

### CRUD completo + paginación + filtros
**Qué significa:** **CRUD:** crear, leer (listar y ver detalle), actualizar y eliminar cada recurso (leads, interacciones, tareas, clientes). **Paginación:** listados por páginas (page, limit) en lugar de cargar todo. **Filtros:** búsqueda y filtros (estado, prioridad, fechas, etc.) para afinar el listado.  
**Dónde está:** Listados en `lead-list.component.ts`, `interaccion-list.component.ts`, `tarea-list.component.ts`, `cliente-list.component.ts` (`frontend-angular/src/app/features/`). Rutas en `frontend-angular/src/app/app.routes.ts`.

### UI Bootstrap
**Qué significa:** Usar el framework **Bootstrap** (o compatible) para la interfaz: grid, botones, tablas, formularios, cards, modales, etc. La rúbrica valora un diseño limpio y coherente.  
**Dónde está:** Toda la app usa clases Bootstrap; estilos globales y tema en `frontend-angular/src/styles.css`.

### Organización de componentes
**Qué significa:** Estructura clara del código: carpetas por funcionalidad (features), servicios/core compartidos, componentes reutilizables (shared). Facilita mantener y ampliar el proyecto.  
**Dónde está:** `frontend-angular/src/app/features/` (dashboard, leads, interacciones, tareas, clientes); `app/core/` (api.service, api-base.token); `app/shared/` (loader, alert); `app/services/`.

### UX (navegación + mensajes)
**Qué significa:** **Navegación:** menú o rutas para ir de una pantalla a otra sin perderse. **Mensajes:** feedback al usuario (éxito, error, “cargando…”) y confirmaciones antes de acciones destructivas (ej. borrar).  
**Dónde está:** Navegación en `frontend-angular/src/app/app.component.ts` (sidebar con RouterLink). Mensajes: `shared/alert.component.ts`; loader: `shared/loader.component.ts`; modal de confirmar borrado en los listados (ej. `lead-list.component.ts`).

---

## 3. BACKEND (50% DWEC)

### Arquitectura (capas)
**Qué significa:** Organizar el backend en capas: rutas → controladores → servicios (lógica) → repositorios o acceso a datos; más config, modelos, validadores y middlewares. Así el código es ordenado y escalable.  
**Dónde está:** `backend/src/` — `config/`, `models/`, `validators/`, `repositories/`, `services/`, `controllers/`, `routes/`, `middlewares/`, `utils/`. Entrada: `app.js` (rutas) y `server.js` (arranque).

### CRUD completo + paginación
**Qué significa:** Que la API permita crear, leer (listar y por id), actualizar y borrar cada recurso, y que los listados soporten paginación (page, limit) y filtros.  
**Dónde está:** Rutas en `backend/src/routes/lead.routes.js`, `interaccion.routes.js`, `tarea.routes.js`, `cliente.routes.js`. Controladores en `backend/src/controllers/`. Paginación en servicios y repositorios (ej. `lead.repository.memory.js` / `lead.repository.mongo.js`).

### Lógica de negocio
**Qué significa:** Las reglas del dominio (ej. “no duplicar lead por teléfono”, “al crear interacción actualizar ultimoContacto del lead”) implementadas en el backend, normalmente en servicios y validadores.  
**Dónde está:** `backend/src/services/lead.service.js` (duplicados, propuesta, cerrado/perdido), `interaccion.service.js` (ultimoContacto, tarea si interesado), `tarea.service.js` (completada, fechas). Validadores en `backend/src/validators/lead.validator.js`, `interaccion.validator.js`, `tarea.validator.js`.

### Manejo de errores y status codes
**Qué significa:** Responder con códigos HTTP adecuados (200, 201, 400, 404, 409, 422, 500) y un cuerpo JSON coherente (ej. `{ ok: false, message, errors }`). Evitar que errores sin capturar devuelvan HTML o stack al cliente.  
**Dónde está:** `backend/src/utils/response.js` (success, created, error, validationErrors). `backend/src/middlewares/errorHandler.js` (captura errores y devuelve JSON con status).

### MongoDB + Mongoose
**Qué significa:** Usar **MongoDB** como base de datos y **Mongoose** para definir esquemas, validaciones e índices. Se valora conexión correcta, modelos bien definidos y uso de timestamps/relaciones si aplica.  
**Dónde está:** Modelos en `backend/src/models/Lead.mongoose.js`, `Interaccion.mongoose.js`, `Tarea.mongoose.js`, `Cliente.mongoose.js`. Conexión en `backend/src/config/mongoose.js`. Uso en `server.js` (si `DATA_PROVIDER=mongo`); repositorios en `backend/src/repositories/*.repository.mongo.js`; factory en `backend/src/repositories/index.js`.

---

## 4. REACT (100% DIW)

### Creación e import de componentes
**Qué significa:** Definir componentes (páginas, botones, alertas, etc.) en archivos y usarlos importándolos donde hagan falta. La rúbrica valora que esté bien hecho y con una estructura clara.  
**Dónde está:** Páginas en `frontend-react/src/pages/*.tsx`. Componentes en `frontend-react/src/components/` (Loader, AlertMessage). Import y uso en `frontend-react/src/App.tsx`.

### Props
**Qué significa:** Pasar datos o callbacks a un componente mediante **props** (ej. `message` y `type` a un componente de alerta). Así los componentes son reutilizables y reciben la información desde el padre.  
**Dónde está:** Uso de props en componentes (ej. `AlertMessage` con `message`, `type`). Definidos en `frontend-react/src/pages/` y `frontend-react/src/components/`.

### Consumo API
**Qué significa:** Llamar a la API REST desde React (fetch o Axios) de forma organizada: por ejemplo un módulo o servicios que centralicen get/post/put/delete y que las páginas los usen. Se valora que sea limpio y reutilizable.  
**Dónde está:** `frontend-react/src/services/api.ts` (Axios, get/post/put/patch/del). Servicios por recurso: `leadService.ts`, `dashboardService.ts`, `interaccionService.ts`, `tareaService.ts`, `clienteService.ts` en `frontend-react/src/services/`.

### Hooks
**Qué significa:** Usar **hooks** de React (`useState`, `useEffect`, `useCallback`, etc.) para estado y efectos. Por ejemplo: estado del listado, cargar datos al montar, reaccionar a cambios de filtros. La rúbrica valora un uso correcto y claro.  
**Dónde está:** `useState`, `useEffect`, `useCallback`, `useNavigate`, `useSearchParams` en las páginas de `frontend-react/src/pages/*.tsx`.

### Validaciones
**Qué significa:** En formularios: comprobar datos antes de enviar (requeridos, formato, rangos) y mostrar mensajes de error al usuario. Puede incluir manejo de errores de validación devueltos por la API.  
**Dónde está:** En `frontend-react/src/pages/LeadFormPage.tsx`, `InteraccionFormPage.tsx`, `TareaFormPage.tsx`, `ClienteFormPage.tsx` (validación al enviar y mensajes de error).

### React Router
**Qué significa:** Navegación entre pantallas con **React Router**: rutas (paths), componentes por ruta, enlaces (Link/NavLink) y redirecciones. La URL cambia y se muestra el componente correspondiente.  
**Dónde está:** `frontend-react/src/App.tsx` (Routes, Route, Link, NavLink, Navigate). Router en `frontend-react/src/main.tsx` (BrowserRouter).

### UI Bootstrap
**Qué significa:** Igual que en Angular: usar Bootstrap (o compatible) para maquetar y dar estilo (grid, botones, tablas, formularios, etc.) de forma coherente.  
**Dónde está:** Clases Bootstrap en todas las páginas; estilos en `frontend-react/src/index.css`.

### Manejo de estado
**Qué significa:** Cómo se guarda y actualiza la información en la app (listados, formularios, filtros, modales). Puede ser solo estado local con `useState` por página o un estado global. La rúbrica valora que sea claro y ordenado.  
**Dónde está:** Estado local con `useState` en cada página (listados, formularios, filtros, modales) en `frontend-react/src/pages/*.tsx`.

---

## Resumen rápido: “¿Dónde está…?”

| Pregunta | Respuesta |
|----------|-----------|
| **Ruta de los diagramas** | `docs/ARQUITECTURA.md` |
| **Ruta de documentación de endpoints** | `README.md` (sección Endpoints), `ENDPOINTS-URLS.md`, y API: `GET /api/v1/documentacion` (código en `backend/src/documentacion.js`) |
| **Ruta de reglas de negocio** | Texto: `README.md` ("Reglas de negocio (8)"). Código: `backend/src/services/lead.service.js`, `interaccion.service.js`, `tarea.service.js` y `backend/src/validators/*.validator.js` |
| **Dónde está el deploy de Angular** | URL: https://angularbertha.nakedcode.es. Build local: `frontend-angular/dist/nakedcrm-lite-angular/browser`. Cómo desplegar: `DEPLOY.md` |
| **Dónde está el deploy de React** | URL: https://reactbertha.nakedcode.es. Build local: `frontend-react/dist`. Cómo desplegar: `DEPLOY.md` |
| **Dónde está el deploy de la API** | URL: https://darkorchid-lapwing-635040.hostingersite.com. Cómo desplegar: `DEPLOY.md` (carpeta `backend`) |
