import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LeadsListPage from './pages/LeadsListPage';
import LeadFormPage from './pages/LeadFormPage';
import LeadDetailPage from './pages/LeadDetailPage';
import InteraccionesListPage from './pages/InteraccionesListPage';
import InteraccionFormPage from './pages/InteraccionFormPage';
import TareasListPage from './pages/TareasListPage';
import TareaFormPage from './pages/TareaFormPage';
import ClientesListPage from './pages/ClientesListPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import ClienteFormPage from './pages/ClienteFormPage';

export default function App() {
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
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsListPage />} />
          <Route path="/leads/new" element={<LeadFormPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/leads/:id/edit" element={<LeadFormPage />} />
          <Route path="/clientes" element={<ClientesListPage />} />
          <Route path="/clientes/new" element={<ClienteFormPage />} />
          <Route path="/clientes/:id" element={<ClienteDetailPage />} />
          <Route path="/clientes/:id/edit" element={<ClienteFormPage />} />
          <Route path="/interacciones" element={<InteraccionesListPage />} />
          <Route path="/interacciones/new" element={<InteraccionFormPage />} />
          <Route path="/interacciones/:id/edit" element={<InteraccionFormPage />} />
          <Route path="/tareas" element={<TareasListPage />} />
          <Route path="/tareas/new" element={<TareaFormPage />} />
          <Route path="/tareas/:id/edit" element={<TareaFormPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
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

