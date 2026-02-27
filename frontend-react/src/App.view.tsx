import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AppViewProps {
  children: ReactNode;
}

/** Vista del layout principal: sidebar, contenido y navegación móvil. */
export default function AppView({ children }: AppViewProps) {
  return (
    <div className="app-wrap">
      <aside className="sidebar-crm">
        <Link className="sidebar-brand" to="/dashboard">NakedCRM Lite</Link>
        <nav className="sidebar-nav">
          <NavLink className="sidebar-link" to="/dashboard"><i className="bi bi-grid-1x2"></i> Dashboard</NavLink>
          <NavLink className="sidebar-link" to="/leads"><i className="bi bi-person-lines-fill"></i> Leads</NavLink>
          <NavLink className="sidebar-link" to="/clientes"><i className="bi bi-building"></i> Clientes</NavLink>
          <NavLink className="sidebar-link" to="/interacciones"><i className="bi bi-chat-dots"></i> Interacciones</NavLink>
          <NavLink className="sidebar-link" to="/tareas"><i className="bi bi-check2-square"></i> Tareas</NavLink>
        </nav>
      </aside>
      <main className="main-content-crm container">
        {children}
      </main>
      <nav className="mobile-bottom-nav" aria-label="Navegación principal">
        <NavLink className="mobile-bottom-link" to="/dashboard" end>
          <i className="bi bi-grid-1x2"></i>
          <span>Inicio</span>
        </NavLink>
        <NavLink className="mobile-bottom-link" to="/leads?estadoPipeline=nuevo" end>
          <i className="bi bi-person-plus"></i>
          <span>Leads sin contactar</span>
        </NavLink>
        <NavLink className="mobile-bottom-link" to="/leads/new" end>
          <i className="bi bi-plus-circle"></i>
          <span>Crear lead</span>
        </NavLink>
        <NavLink className="mobile-bottom-link" to="/clientes">
          <i className="bi bi-building"></i>
          <span>Clientes</span>
        </NavLink>
        <NavLink className="mobile-bottom-link" to="/tareas">
          <i className="bi bi-check2-square"></i>
          <span>Tareas</span>
        </NavLink>
      </nav>
    </div>
  );
}
