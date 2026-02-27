import { Routes, Route, Navigate } from 'react-router-dom';
import AppView from './App.view';
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

/** Lógica de rutas; la vista del layout está en App.view.tsx */
export default function App() {
  return (
    <AppView>
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
    </AppView>
  );
}
