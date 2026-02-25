import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../services/dashboardService';
import { getTareasUpcoming, getTareasToday, updateTarea } from '../services/tareaService';
import { getLeadsPaginated } from '../services/leadService';
import type { DashboardSummary as DS } from '../services/dashboardService';
import type { Tarea } from '../services/tareaService';
import type { Lead } from '../services/leadService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

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
      if (r.ok && r.data) setUpcoming((prev) => (prev.length ? prev : r.data!.slice(0, 10)));
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
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Dashboard</h1>
          <p className="text-muted mb-0">Resumen general de tu actividad comercial</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/leads/new" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i> Nuevo Lead</Link>
          <Link to="/tareas/new" className="btn btn-outline-secondary"><i className="bi bi-check2-square me-1"></i> Nueva Tarea</Link>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="text-muted small fw-bold text-uppercase">Total Leads</div>
                <div className="icon-shape bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-people-fill fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 mb-1">{summary.totalLeads}</h2>
              <div className="small text-muted">
                <span className="text-success fw-medium"><i className="bi bi-arrow-up-short"></i> {summary.leadsActivos}</span> activos
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="text-muted small fw-bold text-uppercase">Clientes Activos</div>
                <div className="icon-shape bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-building-check fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 mb-1">{summary.clientesActivos || 0}</h2>
              <div className="small text-muted">
                <span className="fw-medium">{(summary.conversionRateBasica * 100).toFixed(1)}%</span> tasa conv.
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="text-muted small fw-bold text-uppercase">Tareas Pendientes</div>
                <div className="icon-shape bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-list-task fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 mb-1">{summary.tareasPendientes}</h2>
              <div className="small text-muted">
                {summary.tareasVencidas > 0 ? (
                  <span className="text-danger fw-bold"><i className="bi bi-exclamation-circle"></i> {summary.tareasVencidas} vencidas</span>
                ) : (
                  <span className="text-success"><i className="bi bi-check-circle"></i> Al día</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="text-muted small fw-bold text-uppercase">Reuniones (Semana)</div>
                <div className="icon-shape bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-calendar-event fs-5"></i>
                </div>
              </div>
              <h2 className="display-6 mb-1">{summary.reunionesSemana || 0}</h2>
              <div className="small text-muted">Próximos 7 días</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Columna Izquierda: Leads (sin contactar) + Próximos vencimientos */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 pb-0">
              <h5 className="mb-0"><i className="bi bi-person-plus text-primary me-2"></i>Leads (sin contactar)</h5>
              <Link to="/leads?estadoPipeline=nuevo" className="btn btn-sm btn-link text-decoration-none">Ver todo</Link>
            </div>
            <div className="card-body">
              {leadsSinContactar.length === 0 ? (
                <p className="text-muted mb-0">No hay leads nuevos sin contactar.</p>
              ) : (
                <ul className="list-unstyled mb-0 dashboard-leads-list">
                  {leadsSinContactar.map((l) => (
                    <li key={l.id} className="border-bottom border-secondary pb-2 mb-2">
                      <Link to={`/leads/${l.id}`} className="text-decoration-none fw-medium text-dark d-block">{l.nombre}</Link>
                      <span className="small text-muted">{l.empresa}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
              <h5 className="mb-0">Próximos vencimientos</h5>
            </div>
            <div className="card-body">
              {upcoming.length === 0 ? (
                <p className="text-muted">No hay tareas próximas.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle table-sm">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 ps-0">Título</th>
                        <th className="border-0">Fecha</th>
                        <th className="border-0 pe-0 text-end">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((t) => (
                        <tr key={t.id}>
                          <td className="ps-0 fw-medium">{t.titulo}</td>
                          <td className="text-muted small">{t.fechaVencimiento ? formatDate(t.fechaVencimiento) : '-'}</td>
                          <td className="pe-0 text-end">
                            <Link to={`/tareas/${t.id}/edit`} className="btn btn-sm btn-light"><i className="bi bi-arrow-right"></i></Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Centro: Actividad Reciente */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
              <h5 className="mb-0">Actividad Reciente</h5>
            </div>
            <div className="card-body">
              {summary.actividadReciente && summary.actividadReciente.length > 0 ? (
                <div className="timeline position-relative">
                  <div className="position-absolute top-0 bottom-0 start-0 ms-1 bg-light" style={{ width: '2px', left: '4px' }}></div>
                  {summary.actividadReciente.slice(0, 8).map((a, i) => (
                    <div key={`${a.fecha}-${i}`} className="timeline-item pb-3 position-relative ps-4">
                      <div className="position-absolute start-0 top-0 mt-1 rounded-circle bg-primary border border-white border-2" style={{ width: '10px', height: '10px', zIndex: 1 }}></div>
                      <div className="timeline-content">
                        <div className="small text-muted mb-1">{new Date(a.fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="fw-medium text-dark">{a.titulo}</div>
                        <div className="badge bg-light text-secondary border mt-1 fw-normal" style={{ fontSize: '0.7rem' }}>{a.tipo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Sin actividad reciente.</p>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Para hoy */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 pb-0">
              <h5 className="mb-0"><i className="bi bi-sun text-warning me-2"></i>Para hoy</h5>
              <Link to="/tareas" className="btn btn-sm btn-link text-decoration-none">Ver todo</Link>
            </div>
            <div className="card-body">
              {todayTasks.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-cup-hot display-4 d-block mb-2 opacity-50"></i>
                  <p className="mb-0">¡Todo limpio por hoy!</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {todayTasks.map((t) => (
                    <div key={t.id} className="list-group-item px-0 d-flex align-items-center gap-3 border-bottom-0">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={t.estado === 'hecha'} onChange={() => markAsDone(t)} disabled={markingId === t.id} />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className={t.estado === 'hecha' ? 'text-decoration-line-through fw-medium' : 'fw-medium'}>{t.titulo}</span>
                          <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: '0.7rem' }}>{t.prioridad}</span>
                        </div>
                        {closingTime(t) && (
                          <div className="small text-muted"><i className="bi bi-clock me-1"></i>{formatTime(closingTime(t)!)}</div>
                        )}
                      </div>
                      <Link to={`/tareas/${t.id}/edit`} className="btn btn-sm btn-light text-muted"><i className="bi bi-pencil"></i></Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
