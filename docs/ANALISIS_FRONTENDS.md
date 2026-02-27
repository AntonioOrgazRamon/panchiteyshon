# Análisis de los dos frontends (React y Angular)

## Resumen

El proyecto **bertha** tiene dos frontends que replican la misma aplicación CRM (NakedCRM Lite):

| Aspecto | frontend-react | frontend-angular |
|--------|----------------|------------------|
| **Stack** | React 18 + TypeScript + Vite + React Router | Angular 19 (standalone) + TypeScript |
| **Ubicación** | `frontend-react/` | `frontend-angular/` |
| **Estado del template** | Todo en archivos `.tsx` (JSX + lógica juntos) | Todo en archivos `.ts` (template inline en `template: \`...\``) |
| **Componentes/páginas** | App, Dashboard, Leads (list/form/detail), Clientes, Interacciones, Tareas, Loader, Alert, TareaCalendar | Equivalentes: app, dashboard-summary, lead-list/detail/form, cliente-list/detail/form, interaccion-list/form, tarea-list/form/calendar, loader, alert |

## Cambios realizados

### Angular
- **Antes:** Cada componente tenía `template: \`...\`` y a veces `styles: [\`...\`]` dentro del `.ts`.
- **Después:** Cada componente usa `templateUrl: './nombre.component.html'` y, si aplica, `styleUrls: ['./nombre.component.css']`. El HTML está en archivos `.html` y los estilos en `.css` junto al componente.

### React
- **Antes:** Cada página/componente tenía JSX y lógica en el mismo archivo `.tsx`.
- **Después:** Se separa la **vista** (markup) de la **lógica** (estado, efectos, handlers):
  - **Vista:** archivos `*View.tsx` que solo reciben props y renderizan JSX.
  - **Lógica:** archivos `*.tsx` o `*.ts` que contienen hooks, estado y llamadas a servicios, y que renderizan la vista pasando props.

En React no existe el concepto de "archivo HTML" externo como en Angular; el equivalente al template es el JSX, que queda en archivos `.tsx` dedicados a la vista.

## Estructura resultante

### Angular (por componente)
```
app/
  app.component.ts          → solo lógica y decorator con templateUrl
  app.component.html
  features/
    dashboard/
      dashboard-summary.component.ts
      dashboard-summary.component.html
      dashboard-summary.component.css
    leads/
      lead-list.component.ts
      lead-list.component.html
      lead-list.component.css
    ...
  shared/
    loader.component.ts
    loader.component.html
    alert.component.ts
    alert.component.html
```

### React (por página/componente)
```
src/
  App.tsx                   → solo lógica de rutas; usa App.view.tsx para el layout
  App.view.tsx              → solo markup del layout (sidebar, main, nav)
  pages/
    DashboardPage.tsx       → estado, useEffect, handlers; usa DashboardPage.view.tsx
    DashboardPage.view.tsx  → solo JSX con props (vista presentacional)
  components/
    Loader.tsx, AlertMessage.tsx, etc.
```
En el proyecto se aplicó esta separación en App y en DashboardPage; el resto de páginas puede seguir el mismo patrón (crear *Page.view.tsx y pasar props desde *Page.tsx).

## Ventajas de la separación

- **Angular:** Templates más fáciles de editar en editores con soporte HTML, menos escape de comillas en strings, y estilos en archivos `.css` estándar.
- **React:** Lógica (hooks, estado, API) en un sitio y presentación en otro; más fácil testear la vista con props y reutilizar vistas.
