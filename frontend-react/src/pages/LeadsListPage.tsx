import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getLeadsPaginated, deleteLead, exportCsvUrl, type Lead } from '../services/leadService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const KANBAN_COLS = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'interesado', label: 'Interesado' },
  { id: 'reunion', label: 'Reunión' },
  { id: 'propuesta', label: 'Propuesta' },
  { id: 'cerrado', label: 'Cerrado' },
  { id: 'perdido', label: 'Perdido' }
];

export default function LeadsListPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
  // Filters (estadoPipeline from URL for dashboard "Ver todo")
  const [estadoPipeline, setEstadoPipeline] = useState(() => searchParams.get('estadoPipeline') ?? '');
  const [search, setSearch] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [canalOrigen, setCanalOrigen] = useState('');
  const [fechaCreacionDesde, setFechaCreacionDesde] = useState('');
  const [fechaCreacionHasta, setFechaCreacionHasta] = useState('');
  const [ticketMin, setTicketMin] = useState<number | ''>('');
  const [ticketMax, setTicketMax] = useState<number | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [kanbanDragging, setKanbanDragging] = useState(false);
  const kanbanDragRef = useRef<{ el: HTMLElement; startX: number; startScrollLeft: number } | null>(null);

  const navigate = useNavigate();
  const limit = 50; // Higher limit for Kanban
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function load() {
    setLoading(true);
    getLeadsPaginated({ 
      page, limit, search, estadoPipeline, prioridad, canalOrigen, 
      fechaCreacionDesde: fechaCreacionDesde || undefined, 
      fechaCreacionHasta: fechaCreacionHasta || undefined, 
      ticketMin: ticketMin === '' ? undefined : ticketMin, 
      ticketMax: ticketMax === '' ? undefined : ticketMax 
    }).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setLeads(r.data);
        if (r.meta && typeof r.meta.total === 'number') setTotal(r.meta.total);
      } else {
        setMessage(r.message ?? 'Error');
        setMessageType('error');
      }
    });
  }

  useEffect(() => { load(); }, [page, search, estadoPipeline, prioridad, canalOrigen, fechaCreacionDesde, fechaCreacionHasta, ticketMin, ticketMax]);

  function doDelete() {
    if (!deleteTarget) return;
    deleteLead(deleteTarget.id).then((r) => {
      setDeleteTarget(null);
      if (r.ok) {
        setMessage('Lead eliminado');
        setMessageType('success');
        load();
      } else {
        setMessage(r.message ?? 'Error');
        setMessageType('error');
      }
    });
  }

  const getLeadsByStatus = (status: string) => leads.filter(l => l.estadoPipeline === status);

  const openLead = useCallback((id: string) => { navigate(`/leads/${id}`); }, [navigate]);

  const kanbanDragStart = useCallback((e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest('.kanban-board') as HTMLElement;
    if (!el) return;
    kanbanDragRef.current = { el, startX: e.clientX, startScrollLeft: el.scrollLeft };
    setKanbanDragging(false);
    const onMove = (ev: MouseEvent) => {
      if (!kanbanDragRef.current) return;
      setKanbanDragging(true);
      const dx = ev.clientX - kanbanDragRef.current.startX;
      kanbanDragRef.current.el.scrollLeft = kanbanDragRef.current.startScrollLeft - dx;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      kanbanDragRef.current = null;
      setTimeout(() => setKanbanDragging(false), 0);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const kanbanTouchStart = useCallback((e: React.TouchEvent) => {
    const el = (e.target as HTMLElement).closest('.kanban-board') as HTMLElement;
    if (!el || !e.touches[0]) return;
    const startX = e.touches[0].clientX;
    const startScrollLeft = el.scrollLeft;
    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches[0]) el.scrollLeft = startScrollLeft - (ev.touches[0].clientX - startX);
    };
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
  }, []);

  return (
    <>
      <header className="leads-page-header">
        <div className="leads-page-header__title">
          <h1 className="leads-page-header__h1">Leads</h1>
          <p className="leads-page-header__subtitle">Gestiona tus oportunidades de negocio</p>
        </div>
        <div className="leads-page-header__actions">
          <div className="btn-group" role="group">
            <button type="button" className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('table')} title="Vista tabla"><i className="bi bi-table"></i></button>
            <button type="button" className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('kanban')} title="Vista kanban"><i className="bi bi-kanban"></i></button>
          </div>
          <a className="btn btn-outline-secondary btn-sm" href={exportCsvUrl()} target="_blank" rel="noreferrer" download title="Exportar CSV"><i className="bi bi-download"></i> CSV</a>
          <Link className="btn btn-primary" to="/leads/new"><i className="bi bi-plus-lg me-1"></i> Nuevo Lead</Link>
        </div>
      </header>

      <AlertMessage message={message} type={messageType} />

      <div className="leads-filters card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-4 col-lg-3">
              <label className="form-label visually-hidden">Buscar leads</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar por nombre, empresa..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label visually-hidden">Estado pipeline</label>
              <select className="form-select form-select-sm" value={estadoPipeline} onChange={(e) => setEstadoPipeline(e.target.value)}>
                <option value="">Todos los estados</option>
                {KANBAN_COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label visually-hidden">Prioridad</label>
              <select className="form-select form-select-sm" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                <option value="">Prioridad</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div className="col-md-auto ms-auto">
               <button className="btn btn-light btn-sm text-muted" type="button" onClick={() => setShowFilters(!showFilters)}>
                 <i className="bi bi-sliders"></i> Más filtros
               </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="row g-2 pt-2 mt-2 border-top">
               <div className="col-md-2">
                <label className="form-label small">Canal</label>
                <select className="form-select form-select-sm" value={canalOrigen} onChange={(e) => setCanalOrigen(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="whatsapp">Whatsapp</option>
                  <option value="instagram">Instagram</option>
                  <option value="llamada">Llamada</option>
                  <option value="web">Web</option>
                  <option value="referido">Referido</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small">Creación desde</label>
                <input type="date" className="form-control form-control-sm" value={fechaCreacionDesde} onChange={(e) => setFechaCreacionDesde(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Creación hasta</label>
                <input type="date" className="form-control form-control-sm" value={fechaCreacionHasta} onChange={(e) => setFechaCreacionHasta(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Ticket min</label>
                <input type="number" className="form-control form-control-sm" min={0} value={ticketMin} onChange={(e) => setTicketMin(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Ticket max</label>
                <input type="number" className="form-control form-control-sm" min={0} value={ticketMax} onChange={(e) => setTicketMax(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Max" />
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {viewMode === 'table' ? (
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Nombre / Empresa</th>
                      <th>Contacto</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Ticket</th>
                      <th className="text-end pe-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id}>
                        <td className="ps-4">
                          <div className="fw-medium text-dark">{l.nombre}</div>
                          <div className="small text-muted">{l.empresa}</div>
                        </td>
                        <td>
                          <div className="small"><i className="bi bi-telephone me-1 text-muted"></i> {l.telefono}</div>
                          {l.email && <div className="small text-muted"><i className="bi bi-envelope me-1"></i> {l.email}</div>}
                        </td>
                        <td><span className={`badge badge-pipeline-${l.estadoPipeline}`}>{l.estadoPipeline}</span></td>
                        <td>
                          <span className={`badge rounded-pill ${
                            l.prioridad === 'alta' ? 'bg-danger-subtle text-danger' :
                            l.prioridad === 'media' ? 'bg-warning-subtle text-warning' :
                            'bg-success-subtle text-success'
                          }`}>
                            {l.prioridad}
                          </span>
                        </td>
                        <td className="text-muted">${l.ticketEstimado.toLocaleString()}</td>
                        <td className="text-end pe-4">
                          <div className="btn-group">
                            <Link to={`/leads/${l.id}`} className="btn btn-sm btn-light" title="Ver"><i className="bi bi-eye"></i></Link>
                            <Link to={`/leads/${l.id}/edit`} className="btn btn-sm btn-light" title="Editar"><i className="bi bi-pencil"></i></Link>
                            <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => setDeleteTarget(l)} title="Eliminar"><i className="bi bi-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-white border-top-0 py-3">
                <nav>
                  <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                      <button type="button" className="page-link border-0" onClick={() => setPage((p) => Math.max(1, p - 1))}><i className="bi bi-chevron-left"></i></button>
                    </li>
                    <li className="page-item disabled"><span className="page-link border-0 text-muted">{page} / {totalPages}</span></li>
                    <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                      <button type="button" className="page-link border-0" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><i className="bi bi-chevron-right"></i></button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          ) : (
            <div className="kanban-full-width">
              <div
                className={`kanban-board ${kanbanDragging ? 'kanban-dragging' : ''}`}
                onMouseDown={kanbanDragStart}
                onTouchStart={kanbanTouchStart}
                role="region"
                aria-label="Kanban de leads"
              >
                <div className="kanban-board-inner d-flex flex-nowrap gap-3 pb-3" style={{ minHeight: '600px' }}>
                {KANBAN_COLS.map((col) => (
                  <div key={col.id} className="kanban-column flex-shrink-0">
                    <div className="kanban-column__header">
                      <span className="kanban-column__label">{col.label}</span>
                      <span className="kanban-column__count">{getLeadsByStatus(col.id).length}</span>
                    </div>
                    <div className="kanban-cards d-flex flex-column">
                      {getLeadsByStatus(col.id).map((l) => (
                        <div
                          key={l.id}
                          className={`kanban-card kanban-card-priority-${l.prioridad === 'alta' ? 'alta' : l.prioridad === 'media' ? 'media' : 'baja'}`}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={() => openLead(l.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLead(l.id); } }}
                        >
                          <div className="kanban-card__meta">
                            <span className="kanban-card__value">${l.ticketEstimado.toLocaleString()}</span>
                            <span className="kanban-card__priority" data-prioridad={l.prioridad}>{l.prioridad}</span>
                          </div>
                          <h3 className="kanban-card__name text-truncate">{l.nombre}</h3>
                          <p className="kanban-card__company text-truncate">{l.empresa}</p>
                          <div className="kanban-card__footer">
                            <span className="kanban-card__date">
                              Actualizado {l.updatedAt ? new Date(l.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} />
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3 text-danger"><i className="bi bi-exclamation-circle display-1"></i></div>
                <p className="mb-0">¿Estás seguro de eliminar a <strong>{deleteTarget.nombre}</strong>?</p>
                <p className="text-muted small">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer border-0 justify-content-center pt-0 pb-4">
                <button type="button" className="btn btn-light px-4" onClick={() => setDeleteTarget(null)}>Cancelar</button>
                <button type="button" className="btn btn-danger px-4" onClick={doDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
