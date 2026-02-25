import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLeadById, getLeadInteracciones, getLeadTareas, convertLeadToCliente } from '../services/leadService';
import type { Lead } from '../services/leadService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

interface InteraccionRow {
  id: string;
  tipo: string;
  resumen: string;
  resultado: string;
  fechaInteraccion: string;
}

interface TareaRow {
  id: string;
  titulo: string;
  estado: string;
  fechaVencimiento?: string;
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [interacciones, setInteracciones] = useState<InteraccionRow[]>([]);
  const [tareas, setTareas] = useState<TareaRow[]>([]);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getLeadById(id).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setLead(r.data);
        getLeadInteracciones(id).then((ri) => ri.ok && ri.data && setInteracciones(ri.data as InteraccionRow[]));
        getLeadTareas(id).then((rt) => rt.ok && rt.data && setTareas(rt.data as TareaRow[]));
      } else setError(r.message ?? 'Lead no encontrado');
    });
  }, [id]);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  if (loading) return <Loader />;
  if (error || !lead) return <AlertMessage message={error ?? 'No encontrado'} type="error" />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{lead.nombre} — {lead.empresa}</h1>
        <div>
          {lead.clienteId ? (
            <Link to={`/clientes/${lead.clienteId}`} className="btn btn-success me-2">Ver cliente creado</Link>
          ) : (
            <button type="button" className="btn btn-success me-2" disabled={converting} onClick={() => { setConverting(true); convertLeadToCliente(lead.id).then((r) => { setConverting(false); if (r.ok && r.data) { const data = r.data as { id: string }; setLead({ ...lead, clienteId: data.id }); getLeadById(lead.id).then((refetch) => refetch.ok && refetch.data && setLead(refetch.data)); } }); }}>{converting ? '...' : 'Convertir en cliente'}</button>
          )}
          <Link to={`/leads/${lead.id}/edit`} className="btn btn-primary me-2">Editar</Link>
          <Link to="/leads" className="btn btn-outline-secondary">Volver</Link>
        </div>
      </div>
      {lead.clienteId && (
        <div className="alert alert-info">Este lead fue convertido en cliente. <Link to={`/clientes/${lead.clienteId}`}>Ver cliente</Link></div>
      )}
      <div className="card mb-3">
        <div className="card-body">
          <p><strong>Teléfono:</strong> {lead.telefono}</p>
          <p><strong>Email:</strong> {lead.email ?? '-'}</p>
          <p><strong>Canal origen:</strong> {lead.canalOrigen}</p>
          <p><strong>Estado pipeline:</strong> <span className={`badge badge-pipeline-${lead.estadoPipeline}`}>{lead.estadoPipeline}</span></p>
          <p><strong>Prioridad:</strong> {lead.prioridad}</p>
          <p><strong>Ticket estimado:</strong> {lead.ticketEstimado}</p>
          <p><strong>Localidad:</strong> {lead.localidad ?? '-'}</p>
          <p><strong>Activo:</strong> {lead.activo ? 'Sí' : 'No'}</p>
          <p><strong>Último contacto:</strong> {lead.ultimoContacto ? formatDate(lead.ultimoContacto) : '-'}</p>
          {lead.notas && <p><strong>Notas:</strong> {lead.notas}</p>}
        </div>
      </div>
      <h5>Interacciones</h5>
      {interacciones.length === 0 ? (
        <p className="text-muted">Sin interacciones.</p>
      ) : (
        <table className="table table-sm">
          <thead><tr><th>Tipo</th><th>Resumen</th><th>Resultado</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            {interacciones.map((i) => (
              <tr key={i.id}>
                <td>{i.tipo}</td>
                <td>{i.resumen}</td>
                <td>{i.resultado}</td>
                <td>{formatDate(i.fechaInteraccion)}</td>
                <td><Link to={`/interacciones/${i.id}/edit`}>Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h5 className="mt-3">Tareas</h5>
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
      <Link to={`/interacciones/new?leadId=${lead.id}`} className="btn btn-outline-primary me-2">Nueva interacción</Link>
      <Link to={`/tareas/new?leadId=${lead.id}`} className="btn btn-outline-primary">Nueva tarea</Link>
    </>
  );
}
