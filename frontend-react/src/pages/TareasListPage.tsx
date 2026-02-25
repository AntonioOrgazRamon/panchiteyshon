import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTareasPaginated, getTareas, deleteTarea, type Tarea } from '../services/tareaService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';
import TareaCalendar from '../components/TareaCalendar';

type ViewMode = 'lista' | 'mes' | 'semana';

export default function TareasListPage() {
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Tarea | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('lista');
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [allTasksForCalendar, setAllTasksForCalendar] = useState<Tarea[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function load() {
    setLoading(true);
    getTareasPaginated({ page, limit, estado, prioridad }).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setTareas(r.data);
        if (r.meta && typeof r.meta.total === 'number') setTotal(r.meta.total);
      }
    });
  }

  function loadCalendar() {
    setLoadingCalendar(true);
    getTareas().then((r) => {
      setLoadingCalendar(false);
      if (r.ok && r.data) setAllTasksForCalendar(r.data);
    });
  }

  function setView(mode: ViewMode) {
    setViewMode(mode);
    if (mode === 'mes' || mode === 'semana') loadCalendar();
  }

  function calendarPrev() {
    const d = new Date(calendarDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCalendarDate(d);
  }

  function calendarNext() {
    const d = new Date(calendarDate);
    if (viewMode === 'mes') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCalendarDate(d);
  }

  useEffect(() => { load(); }, [page, estado, prioridad]);

  function doDelete() {
    if (!deleteTarget) return;
    deleteTarea(deleteTarget.id).then((r) => {
      setDeleteTarget(null);
      if (r.ok) { setMessage('Tarea eliminada'); setMessageType('success'); load(); }
      else { setMessage(r.message ?? 'Error'); setMessageType('error'); }
    });
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tareas</h1>
        <Link className="btn btn-primary" to="/tareas/new">Nueva tarea</Link>
      </div>
      <AlertMessage message={message} type={messageType} />
      <div className="btn-group mb-3" role="group">
        <button type="button" className={`btn ${viewMode === 'lista' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('lista')}>Lista</button>
        <button type="button" className={`btn ${viewMode === 'mes' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('mes')}>Mes</button>
        <button type="button" className={`btn ${viewMode === 'semana' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('semana')}>Semana</button>
      </div>
      {(viewMode === 'mes' || viewMode === 'semana') && (
        loadingCalendar ? <Loader /> : (
          <TareaCalendar
            tasks={allTasksForCalendar}
            current={calendarDate}
            view={viewMode}
            onPrev={calendarPrev}
            onNext={calendarNext}
          />
        )
      )}
      {viewMode === 'lista' && (
      <>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-2">
              <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Estado</option>
                <option value="pendiente">pendiente</option>
                <option value="en_progreso">en_progreso</option>
                <option value="hecha">hecha</option>
                <option value="cancelada">cancelada</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                <option value="">Prioridad</option>
                <option value="baja">baja</option>
                <option value="media">media</option>
                <option value="alta">alta</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Vencimiento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id}>
                  <td>{t.titulo}</td>
                  <td>{t.tipo}</td>
                  <td>{t.estado}</td>
                  <td>{t.prioridad}</td>
                  <td>{t.fechaVencimiento ? formatDate(t.fechaVencimiento) : '-'}</td>
                  <td>
                    <Link to={`/tareas/${t.id}/edit`} className="btn btn-sm btn-outline-primary">Editar</Link>
                    <button type="button" className="btn btn-sm btn-outline-danger ms-1" onClick={() => setDeleteTarget(t)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav>
            <ul className="pagination">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}>Anterior</a>
              </li>
              <li className="page-item disabled"><span className="page-link">{page} / {totalPages}</span></li>
              <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}>Siguiente</a>
              </li>
            </ul>
          </nav>
        </>
      )}
      </>)}
      {deleteTarget && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Confirmar</h5><button type="button" className="btn-close" onClick={() => setDeleteTarget(null)}></button></div>
              <div className="modal-body">¿Eliminar tarea {deleteTarget.titulo}?</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={doDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
