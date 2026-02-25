import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClienteById, createCliente, updateCliente } from '../services/clienteService';
import type { Cliente } from '../services/clienteService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const ESTADOS = ['activo', 'pausado', 'finalizado'];

export default function ClienteFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombreContacto: '',
    empresa: '',
    telefono: '',
    email: '',
    ciudad: '',
    web: '',
    estadoCliente: 'activo',
    serviciosContratadosStr: '',
    mrr: '' as number | '',
    proximaRevision: '',
    observacionesInternas: '',
  });

  useEffect(() => {
    if (!id || id === 'new') return;
    getClienteById(id).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        const d = r.data;
        setForm({
          nombreContacto: d.nombreContacto,
          empresa: d.empresa,
          telefono: d.telefono,
          email: d.email ?? '',
          ciudad: d.ciudad ?? '',
          web: d.web ?? '',
          estadoCliente: d.estadoCliente,
          serviciosContratadosStr: Array.isArray(d.serviciosContratados) ? d.serviciosContratados.join(', ') : '',
          mrr: d.mrr ?? '',
          proximaRevision: d.proximaRevision ? d.proximaRevision.slice(0, 16) : '',
          observacionesInternas: d.observacionesInternas ?? '',
        });
      }
    });
  }, [id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const servicios = form.serviciosContratadosStr.trim() ? form.serviciosContratadosStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const payload: Partial<Cliente> = {
      nombreContacto: form.nombreContacto,
      empresa: form.empresa,
      telefono: form.telefono,
      email: form.email || '',
      ciudad: form.ciudad || '',
      web: form.web || '',
      estadoCliente: form.estadoCliente,
      serviciosContratados: servicios,
      mrr: form.mrr !== '' ? Number(form.mrr) : null,
      proximaRevision: form.proximaRevision ? new Date(form.proximaRevision).toISOString() : null,
      observacionesInternas: form.observacionesInternas || '',
    };
    if (id && id !== 'new') {
      updateCliente(id, payload, true).then((r) => {
        if (r.ok) navigate('/clientes');
        else setMessage(r.message ?? 'Error');
      });
    } else {
      createCliente(payload).then((r) => {
        if (r.ok) navigate('/clientes');
        else setMessage(r.message ?? 'Error');
      });
    }
  }

  if (loading) return <Loader />;

  return (
    <>
      <h1>{id && id !== 'new' ? 'Editar cliente' : 'Nuevo cliente'}</h1>
      <AlertMessage message={message} type="error" />
      <form onSubmit={handleSubmit} className="card card-body">
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label">Nombre contacto *</label>
            <input type="text" className="form-control" required value={form.nombreContacto} onChange={(e) => setForm((f) => ({ ...f, nombreContacto: e.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Empresa *</label>
            <input type="text" className="form-control" required value={form.empresa} onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Teléfono *</label>
            <input type="text" className="form-control" required value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Ciudad</label>
            <input type="text" className="form-control" value={form.ciudad} onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Web</label>
            <input type="text" className="form-control" value={form.web} onChange={(e) => setForm((f) => ({ ...f, web: e.target.value }))} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.estadoCliente} onChange={(e) => setForm((f) => ({ ...f, estadoCliente: e.target.value }))}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">MRR (≥ 0)</label>
            <input type="number" className="form-control" min={0} value={form.mrr} onChange={(e) => setForm((f) => ({ ...f, mrr: e.target.value === '' ? '' : Number(e.target.value) }))} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Próxima revisión</label>
            <input type="datetime-local" className="form-control" value={form.proximaRevision} onChange={(e) => setForm((f) => ({ ...f, proximaRevision: e.target.value }))} />
          </div>
          <div className="col-12">
            <label className="form-label">Servicios (separados por coma)</label>
            <input type="text" className="form-control" placeholder="Web, Marketing" value={form.serviciosContratadosStr} onChange={(e) => setForm((f) => ({ ...f, serviciosContratadosStr: e.target.value }))} />
          </div>
          <div className="col-12">
            <label className="form-label">Observaciones internas</label>
            <textarea className="form-control" rows={3} value={form.observacionesInternas} onChange={(e) => setForm((f) => ({ ...f, observacionesInternas: e.target.value }))} />
          </div>
        </div>
        <div className="mt-3">
          <button type="submit" className="btn btn-primary">Guardar</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/clientes')}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
