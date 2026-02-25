import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { getTareaById, createTarea, updateTarea } from '../services/tareaService';
import { getLeads, type Lead } from '../services/leadService';
import { getClientes, type Cliente } from '../services/clienteService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const emptyForm = {
  titulo: '',
  descripcion: '',
  tipo: 'seguimiento',
  estado: 'pendiente',
  prioridad: 'media',
  leadId: '' as string | null,
  clienteId: '' as string | null,
  categoriaPlanificacion: 'puntual',
  fechaVencimiento: '',
  fechaRecordatorio: '',
  completada: false,
};

export default function TareaFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(isEdit);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    getLeads().then((r) => r.ok && r.data && setLeads(r.data));
    getClientes().then((r) => r.ok && r.data && setClientes(r.data));
  }, []);

  useEffect(() => {
    const leadId = searchParams.get('leadId');
    const clienteId = searchParams.get('clienteId');
    if (leadId) setForm((f) => ({ ...f, leadId, clienteId: '' }));
    if (clienteId) setForm((f) => ({ ...f, clienteId, leadId: '' }));
  }, [searchParams]);

  useEffect(() => {
    if (!isEdit || !id) { setLoading(false); return; }
    getTareaById(id).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        const d = r.data;
        setForm({
          titulo: d.titulo,
          descripcion: d.descripcion ?? '',
          tipo: d.tipo,
          estado: d.estado,
          prioridad: d.prioridad,
          leadId: d.leadId ?? '',
          clienteId: d.clienteId ?? '',
          categoriaPlanificacion: d.categoriaPlanificacion ?? 'puntual',
          fechaVencimiento: d.fechaVencimiento ? String(d.fechaVencimiento).slice(0, 10) : '',
          fechaRecordatorio: d.fechaRecordatorio ? String(d.fechaRecordatorio).slice(0, 10) : '',
          completada: d.completada,
        });
      }
    });
  }, [id, isEdit]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion || '',
      tipo: form.tipo,
      estado: form.estado,
      prioridad: form.prioridad,
      leadId: form.leadId || null,
      clienteId: form.clienteId || null,
      categoriaPlanificacion: form.categoriaPlanificacion || 'puntual',
      fechaVencimiento: form.fechaVencimiento ? new Date(form.fechaVencimiento).toISOString() : null,
      fechaRecordatorio: form.fechaRecordatorio ? new Date(form.fechaRecordatorio).toISOString() : null,
      completada: form.completada,
    };
    if (isEdit && id) {
      updateTarea(id, payload, true).then((r) => {
        if (r.ok) navigate('/tareas');
        else setMessage(r.message ?? 'Error');
      });
    } else {
      createTarea(payload).then((r) => {
        if (r.ok) navigate('/tareas');
        else setMessage(r.message ?? 'Error');
      });
    }
  }

  if (loading) return <Loader />;

  return (
    <>
      <h1>{isEdit ? 'Editar tarea' : 'Nueva tarea'}</h1>
      <AlertMessage message={message} type="error" />
      <form onSubmit={handleSubmit} className="card card-body">
        <div className="mb-2">
          <label className="form-label">Título *</label>
          <input type="text" className="form-control" name="titulo" value={form.titulo} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label className="form-label">Descripción</label>
          <textarea className="form-control" name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} />
        </div>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Tipo</label>
            <select className="form-select" name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="seguimiento">seguimiento</option>
              <option value="reunion">reunion</option>
              <option value="interna">interna</option>
              <option value="recordatorio">recordatorio</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Estado</label>
            <select className="form-select" name="estado" value={form.estado} onChange={handleChange}>
              <option value="pendiente">pendiente</option>
              <option value="en_progreso">en_progreso</option>
              <option value="hecha">hecha</option>
              <option value="cancelada">cancelada</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Prioridad</label>
            <select className="form-select" name="prioridad" value={form.prioridad} onChange={handleChange}>
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
            </select>
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label">Lead</label>
            <select className="form-select" name="leadId" value={form.leadId ?? ''} onChange={handleChange}>
              <option value="">— Sin lead —</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.nombre} — {l.empresa}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Cliente</label>
            <select className="form-select" name="clienteId" value={form.clienteId ?? ''} onChange={handleChange}>
              <option value="">— Sin cliente —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombreContacto} — {c.empresa}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-2">
          <label className="form-label">Categoría planificación</label>
          <select className="form-select" name="categoriaPlanificacion" value={form.categoriaPlanificacion} onChange={handleChange}>
            <option value="puntual">puntual</option>
            <option value="diaria">diaria</option>
            <option value="semanal">semanal</option>
          </select>
        </div>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Fecha vencimiento</label>
            <input type="date" className="form-control" name="fechaVencimiento" value={form.fechaVencimiento} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Fecha recordatorio</label>
            <input type="date" className="form-control" name="fechaRecordatorio" value={form.fechaRecordatorio} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Completada</label>
            <div className="form-check mt-2">
              <input type="checkbox" className="form-check-input" name="completada" checked={form.completada} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <button type="submit" className="btn btn-primary" disabled={!form.titulo.trim()}>Guardar</button>
          <Link to="/tareas" className="btn btn-secondary ms-2">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
