import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLeadById, createLead, updateLead } from '../services/leadService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const CANALES = ['whatsapp', 'instagram', 'llamada', 'web', 'referido', 'otro'];
const ESTADOS = ['nuevo', 'contactado', 'interesado', 'reunion', 'propuesta', 'cerrado', 'perdido'];
const PRIORIDADES = ['baja', 'media', 'alta'];

const emptyForm = {
  nombre: '',
  empresa: '',
  telefono: '',
  email: '',
  canalOrigen: 'otro',
  estadoPipeline: 'nuevo',
  ticketEstimado: 0,
  prioridad: 'media',
  localidad: '',
  notas: '',
  activo: true,
};

export default function LeadFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(isEdit);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isEdit || !id) {
      setLoading(false);
      return;
    }
    getLeadById(id).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        setForm({
          nombre: r.data.nombre,
          empresa: r.data.empresa,
          telefono: r.data.telefono,
          email: r.data.email ?? '',
          canalOrigen: r.data.canalOrigen,
          estadoPipeline: r.data.estadoPipeline,
          ticketEstimado: r.data.ticketEstimado,
          prioridad: r.data.prioridad,
          localidad: r.data.localidad ?? '',
          notas: r.data.notas ?? '',
          activo: r.data.activo,
        });
      }
    });
  }, [id, isEdit]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [name]: name === 'ticketEstimado' ? Number(value) : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (isEdit && id) {
      updateLead(id, form, true).then((r) => {
        if (r.ok) navigate('/leads');
        else setMessage(r.errors?.map((x) => x.message).join(', ') ?? r.message ?? 'Error');
      });
    } else {
      createLead(form).then((r) => {
        if (r.ok) navigate('/leads');
        else setMessage(r.errors?.map((x) => x.message).join(', ') ?? r.message ?? 'Error');
      });
    }
  }

  const invalid = !form.nombre.trim() || !form.empresa.trim() || !form.telefono.trim() || form.ticketEstimado < 0;

  if (loading) return <Loader />;

  return (
    <>
      <h1>{isEdit ? 'Editar lead' : 'Nuevo lead'}</h1>
      <AlertMessage message={message} type="error" />
      <form onSubmit={handleSubmit} className="card card-body">
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label">Nombre *</label>
            <input type="text" className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Empresa *</label>
            <input type="text" className="form-control" name="empresa" value={form.empresa} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Teléfono *</label>
            <input type="text" className="form-control" name="telefono" value={form.telefono} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Canal origen</label>
            <select className="form-select" name="canalOrigen" value={form.canalOrigen} onChange={handleChange}>
              {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Estado pipeline</label>
            <select className="form-select" name="estadoPipeline" value={form.estadoPipeline} onChange={handleChange}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Prioridad</label>
            <select className="form-select" name="prioridad" value={form.prioridad} onChange={handleChange}>
              {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Ticket estimado *</label>
            <input type="number" className="form-control" name="ticketEstimado" value={form.ticketEstimado} onChange={handleChange} min={0} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Localidad</label>
            <input type="text" className="form-control" name="localidad" value={form.localidad} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Activo</label>
            <div className="form-check mt-2">
              <input type="checkbox" className="form-check-input" name="activo" checked={form.activo} onChange={handleChange} />
              <label className="form-check-label">Activo</label>
            </div>
          </div>
          <div className="col-12">
            <label className="form-label">Notas</label>
            <textarea className="form-control" name="notas" value={form.notas} onChange={handleChange} rows={2} />
          </div>
        </div>
        <div className="mt-3">
          <button type="submit" className="btn btn-primary" disabled={invalid}>Guardar</button>
          <Link to="/leads" className="btn btn-secondary ms-2">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
