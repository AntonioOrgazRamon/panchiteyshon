import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientesPaginated, getClientes, deleteCliente, type Cliente } from '../services/clienteService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const ESTADOS = ['activo', 'pausado', 'finalizado'];

export default function ClientesListPage() {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [estadoCliente, setEstadoCliente] = useState('');
  const [servicio, setServicio] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [kpiActivos, setKpiActivos] = useState(0);
  const [kpiMrr, setKpiMrr] = useState(0);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function load() {
    setLoading(true);
    getClientesPaginated({ page, limit, search, estadoCliente, servicio }).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setClientes(r.data);
        if (r.meta && typeof r.meta.total === 'number') setTotal(r.meta.total);
      } else {
        setMessage(r.message ?? 'Error');
        setMessageType('error');
      }
    });
  }

  useEffect(() => { load(); }, [page, search, estadoCliente, servicio]);
  useEffect(() => {
    getClientes().then((r) => {
      if (r.ok && r.data) {
        setKpiActivos(r.data.filter((c) => c.estadoCliente === 'activo').length);
        setKpiMrr(r.data.reduce((acc, c) => acc + (c.mrr ?? 0), 0));
      }
    });
  }, []);

  function doDelete() {
    if (!deleteTarget) return;
    deleteCliente(deleteTarget.id).then((r) => {
      setDeleteTarget(null);
      if (r.ok) {
        setMessage('Cliente eliminado');
        setMessageType('success');
        load();
      } else {
        setMessage(r.message ?? 'Error');
        setMessageType('error');
      }
    });
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Clientes</h1>
        <Link className="btn btn-primary" to="/clientes/new">Nuevo cliente</Link>
      </div>
      <AlertMessage message={message} type={messageType} />
      <div className="row g-2 mb-3">
        <span className="badge bg-success">Activos: {kpiActivos}</span>
        {kpiMrr > 0 && <span className="badge bg-info">MRR total: {kpiMrr.toLocaleString()}</span>}
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={estadoCliente} onChange={(e) => setEstadoCliente(e.target.value)}>
                <option value="">Estado</option>
                {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <input type="text" className="form-control" placeholder="Servicio" value={servicio} onChange={(e) => setServicio(e.target.value)} />
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
                <th>Contacto</th>
                <th>Empresa</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>MRR</th>
                <th>Próx. revisión</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombreContacto}</td>
                  <td>{c.empresa}</td>
                  <td>{c.telefono}</td>
                  <td><span className={`badge bg-${c.estadoCliente === 'activo' ? 'success' : c.estadoCliente === 'pausado' ? 'warning text-dark' : 'secondary'}`}>{c.estadoCliente}</span></td>
                  <td>{c.mrr != null ? c.mrr.toLocaleString() : '-'}</td>
                  <td>{c.proximaRevision ? formatDate(c.proximaRevision) : '-'}</td>
                  <td>
                    <Link to={`/clientes/${c.id}`} className="btn btn-sm btn-outline-primary me-1">Ver</Link>
                    <Link to={`/clientes/${c.id}/edit`} className="btn btn-sm btn-outline-secondary me-1">Editar</Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(c)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav>
            <ul className="pagination">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                <button type="button" className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
              </li>
              <li className="page-item disabled"><span className="page-link">{page} / {totalPages}</span></li>
              <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                <button type="button" className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</button>
              </li>
            </ul>
          </nav>
        </>
      )}
      {deleteTarget && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} />
              </div>
              <div className="modal-body">¿Eliminar cliente {deleteTarget.nombreContacto} ({deleteTarget.empresa})?</div>
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
