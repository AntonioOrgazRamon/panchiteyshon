import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/dashboardService';
import { getTareasUpcoming, getTareasToday, updateTarea } from '../services/tareaService';
import { getLeadsPaginated } from '../services/leadService';
import type { DashboardSummary as DS } from '../services/dashboardService';
import type { Tarea } from '../services/tareaService';
import type { Lead } from '../services/leadService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';
import DashboardPageView from './DashboardPage.view';

/** Lógica del dashboard: estado, efectos y llamadas a servicios. La vista está en DashboardPage.view.tsx */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DS | null>(null);
  const [leadsSinContactar, setLeadsSinContactar] = useState<Lead[]>([]);
  const [upcoming, setUpcoming] = useState<Tarea[]>([]);
  const [todayTasks, setTodayTasks] = useState<Tarea[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const refreshTodayTasks = () => {
    getTareasToday().then((r) => {
      if (r.ok && r.data) setTodayTasks(r.data);
    });
  };

  useEffect(() => {
    getDashboardSummary().then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setSummary(r.data);
        if (r.data.tareasHoy?.length) setTodayTasks(r.data.tareasHoy as Tarea[]);
        if (r.data.proximasTareas?.length) setUpcoming(r.data.proximasTareas.slice(0, 10) as Tarea[]);
      } else setError(r.message ?? 'Error al cargar');
    });
    getLeadsPaginated({ estadoPipeline: 'nuevo', limit: 12 }).then((r) => {
      if (r.ok && r.data) setLeadsSinContactar(r.data);
    });
    getTareasUpcoming(7).then((r) => {
      if (r.ok && r.data) setUpcoming((prev: Tarea[]) => (prev.length ? prev : r.data!.slice(0, 10)));
    });
    refreshTodayTasks();
  }, []);

  const markAsDone = async (t: Tarea) => {
    setMarkingId(t.id);
    const r = await updateTarea(t.id, { estado: 'hecha', completada: true }, true);
    setMarkingId(null);
    if (r.ok) refreshTodayTasks();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const closingTime = (t: Tarea) => t.fechaVencimiento || t.fechaRecordatorio;
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <Loader />;
  if (error) return <AlertMessage message={error} type="error" />;
  if (!summary) return null;

  return (
    <DashboardPageView
      summary={summary}
      leadsSinContactar={leadsSinContactar}
      upcoming={upcoming}
      todayTasks={todayTasks}
      markingId={markingId}
      formatDate={formatDate}
      formatTime={formatTime}
      closingTime={closingTime}
      markAsDone={markAsDone}
    />
  );
}
