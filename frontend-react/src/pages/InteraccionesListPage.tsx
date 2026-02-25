import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInteraccionesPaginated, deleteInteraccion, type Interaccion } from '../services/interaccionService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

export default function InteraccionesListPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Interaccion[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [leadId, setLeadId] = useState('');
  const [tipo, setTipo] = useState('');
  const [resultado, setResultado] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Interaccion | null>(null);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function load() {
    setLoading(true);
    getInteraccionesPaginated({ page, limit, leadId, tipo, resultado }).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setItems(r.data);
        if (r.meta && typeof r.meta.total === 'number') setTotal(r.meta.total);
      }
    });
  }

  useEffect(() => { load(); }, [page, leadId, tipo, resultado]);

  function doDelete() {
    if (!deleteTarget) return;
    deleteInteraccion(deleteTarget.id).then((r) => {
      setDeleteTarget(null);
      if (r.ok) { setMessage('Eliminada'); setMessageType('success'); load(); }
      else { setMessage(r.message ?? 'Error'); setMessageType('error'); }
    });
  }

  const formatDate = (d: string) => new Date(d).toLocaleString();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Interacciones</h1>
        <Link className="btn btn-primary" to="/interacciones/new">Nueva interacción</Link>
      </div>
      <AlertMessage message={message} type={messageType} />
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Lead ID" value={leadId} onChange={(e) => setLeadId(e.target.value)} />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Tipo</option>
                <option value="llamada">llamada</option>
                <option value="whatsapp">whatsapp</option>
                <option value="email">email</option>
                <option value="reunion">reunion</option>
                <option value="nota">nota</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={resultado} onChange={(e) => setResultado(e.target.value)}>
                <option value="">Resultado</option>
                <option value="sin_respuesta">sin_respuesta</option>
                <option value="respondio">respondio</option>
                <option value="interesado">interesado</option>
                <option value="no_interesa">no_interesa</option>
                <option value="pendiente">pendiente</option>
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
                <th>Lead ID</th>
                <th>Tipo</th>
                <th>Resumen</th>
                <th>Resultado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><Link to={`/leads/${i.leadId}`}>{i.leadId.slice(0, 8)}...</Link></td>
                  <td>{i.tipo}</td>
                  <td>{i.resumen.length > 40 ? i.resumen.slice(0, 40) + '...' : i.resumen}</td>
                  <td>{i.resultado}</td>
                  <td>{formatDate(i.fechaInteraccion)}</td>
                  <td>
                    <Link to={`/interacciones/${i.id}/edit`} className="btn btn-sm btn-outline-primary me-1">Editar</Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(i)}>Eliminar</button>
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
      {deleteTarget && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Confirmar</h5><button type="button" className="btn-close" onClick={() => setDeleteTarget(null)}></button></div>
              <div className="modal-body">¿Eliminar esta interacción?</div>
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
