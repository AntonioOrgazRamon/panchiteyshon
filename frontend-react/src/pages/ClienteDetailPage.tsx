import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClienteById, getClienteTareas } from '../services/clienteService';
import type { Cliente } from '../services/clienteService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

interface TareaRow {
  id: string;
  titulo: string;
  estado: string;
  fechaVencimiento?: string;
}

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [tareas, setTareas] = useState<TareaRow[]>([]);

  useEffect(() => {
    if (!id) return;
    getClienteById(id).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setCliente(r.data);
        getClienteTareas(id).then((rt) => rt.ok && rt.data && setTareas(rt.data as TareaRow[]));
      } else setError(r.message ?? 'Cliente no encontrado');
    });
  }, [id]);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  if (loading) return <Loader />;
  if (error || !cliente) return <AlertMessage message={error ?? 'No encontrado'} type="error" />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{cliente.nombreContacto} — {cliente.empresa}</h1>
        <div>
          <Link to={`/clientes/${cliente.id}/edit`} className="btn btn-primary me-2">Editar</Link>
          <Link to="/clientes" className="btn btn-outline-secondary">Volver</Link>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Email:</strong> {cliente.email ?? '-'}</p>
          <p><strong>Ciudad:</strong> {cliente.ciudad ?? '-'}</p>
          <p><strong>Web:</strong> {cliente.web ?? '-'}</p>
          <p><strong>Estado:</strong> <span className={`badge bg-${cliente.estadoCliente === 'activo' ? 'success' : cliente.estadoCliente === 'pausado' ? 'warning text-dark' : 'secondary'}`}>{cliente.estadoCliente}</span></p>
          <p><strong>MRR:</strong> {cliente.mrr != null ? cliente.mrr.toLocaleString() : '-'}</p>
          <p><strong>Fecha alta:</strong> {formatDate(cliente.fechaAlta)}</p>
          <p><strong>Última interacción:</strong> {cliente.ultimaInteraccion ? formatDate(cliente.ultimaInteraccion) : '-'}</p>
          <p><strong>Próxima revisión:</strong> {cliente.proximaRevision ? formatDate(cliente.proximaRevision) : '-'}</p>
          {cliente.serviciosContratados?.length > 0 && <p><strong>Servicios:</strong> {cliente.serviciosContratados.join(', ')}</p>}
          {cliente.leadOrigenId && <p><strong>Lead origen:</strong> <Link to={`/leads/${cliente.leadOrigenId}`}>Ver lead</Link></p>}
          {cliente.observacionesInternas && <p><strong>Observaciones:</strong><br />{cliente.observacionesInternas}</p>}
        </div>
      </div>
      <h5>Tareas asociadas</h5>
      {tareas.length === 0 ? (
        <p className="text-muted">Sin tareas.</p>
      ) : (
        <table className="table table-sm">
          <thead><tr><th>Título</th><th>Estado</th><th>Vencimiento</th><th></th></tr></thead>
          <tbody>
            {tareas.map((t) => (
              <tr key={t.id}>
                <td>{t.titulo}</td>
                <td>{t.estado}</td>
                <td>{t.fechaVencimiento ? new Date(t.fechaVencimiento).toLocaleDateString() : '-'}</td>
                <td><Link to={`/tareas/${t.id}/edit`}>Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to={`/tareas/new?clienteId=${cliente.id}`} className="btn btn-outline-primary">Nueva tarea</Link>
    </>
  );
}
