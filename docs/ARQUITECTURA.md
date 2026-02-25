# Diagrama de arquitectura — NakedCRM Lite

## Vista general del sistema

```mermaid
flowchart LR
  subgraph Frontends
    A[Angular SPA\n:4200]
    R[React SPA\n:5173]
  end
  subgraph Backend
    API[Express API\n:3000\n/api/v1]
  end
  subgraph Datos
    M[(Memory)]
    DB[(MongoDB\nopcional)]
  end
  A -->|HTTP REST| API
  R -->|HTTP REST| API
  API --> M
  API -.->|DATA_PROVIDER=mongo| DB
```

## Flujo de capas (Backend)

```mermaid
flowchart TB
  subgraph Cliente
    Req[Petición HTTP]
  end
  subgraph Express
    Routes[Routes\n/api/v1/leads|interacciones|tareas|...]
    Ctrl[Controllers]
    MW[Middlewares\nCORS, JSON, errorHandler]
  end
  subgraph Lógica
    Svc[Services\nlógica de negocio]
  end
  subgraph Persistencia
    Repo[Repositories\nmemory | mongo]
  end
  Req --> Routes --> Ctrl --> Svc --> Repo
  Repo --> Svc --> Ctrl --> Res[Respuesta JSON]
  Req --> MW
  Res --> MW
```

## Entidades principales

```mermaid
erDiagram
  Lead ||--o{ Interaccion : tiene
  Lead ||--o{ Tarea : tiene
  Lead }o--|| Cliente : "convierte en"
  Lead {
    string id
    string nombre
    string empresa
    string telefono
    string estadoPipeline
    number ticketEstimado
    boolean activo
  }
  Interaccion {
    string id
    string leadId
    string tipo
    date fechaInteraccion
  }
  Tarea {
    string id
    string titulo
    string estado
    string leadId
  }
  Cliente {
    string id
    string nombre
  }
```

Puedes visualizar estos diagramas en cualquier visor de Mermaid (GitHub, GitLab, VS Code con extensión Mermaid, o [mermaid.live](https://mermaid.live)).
