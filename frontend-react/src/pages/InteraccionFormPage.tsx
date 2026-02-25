import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { getInteraccionById, createInteraccion, updateInteraccion } from '../services/interaccionService';
import { getLeads, type Lead } from '../services/leadService';
import Loader from '../components/Loader';
import AlertMessage from '../components/AlertMessage';

const emptyForm = {
  leadId: '',
  tipo: 'nota',
  direccion: 'saliente',
  resumen: '',
  resultado: 'pendiente',
  fechaInteraccion: new Date().toISOString().slice(0, 16),
  proximaAccionFecha: '',
  duracionMin: '' as string | number,
};

export default function InteraccionFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(isEdit);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    getLeads().then((r) => r.ok && r.data && setLeads(r.data));
  }, []);

  useEffect(() => {
    const leadId = searchParams.get('leadId');
    if (leadId) setForm((f) => ({ ...f, leadId }));
  }, [searchParams]);

  useEffect(() => {
    if (!isEdit || !id) { setLoading(false); return; }
    getInteraccionById(id).then((r) => {
      setLoading(false);
      if (r.ok && r.data) {
        const d = r.data;
        setForm({
          leadId: d.leadId,
          tipo: d.tipo,
          direccion: d.direccion,
          resumen: d.resumen,
          resultado: d.resultado,
          fechaInteraccion: d.fechaInteraccion ? new Date(d.fechaInteraccion).toISOString().slice(0, 16) : emptyForm.fechaInteraccion,
          proximaAccionFecha: d.proximaAccionFecha ? new Date(d.proximaAccionFecha).toISOString().slice(0, 16) : '',
          duracionMin: d.duracionMin ?? '',
        });
      }
    });
  }, [id, isEdit]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      leadId: form.leadId,
      tipo: form.tipo,
      direccion: form.direccion,
      resumen: form.resumen,
      resultado: form.resultado,
      fechaInteraccion: new Date(form.fechaInteraccion).toISOString(),
      proximaAccionFecha: form.proximaAccionFecha ? new Date(form.proximaAccionFecha).toISOString() : null,
      duracionMin: form.duracionMin !== '' ? Number(form.duracionMin) : null,
    };
    if (isEdit && id) {
      updateInteraccion(id, payload, true).then((r) => {
        if (r.ok) navigate('/interacciones');
        else setMessage(r.message ?? 'Error');
      });
    } else {
      createInteraccion(payload).then((r) => {
        if (r.ok) navigate('/interacciones');
        else setMessage(r.message ?? 'Error');
      });
    }
  }

  if (loading) return <Loader />;

  return (
    <>
      <h1>{isEdit ? 'Editar interacción' : 'Nueva interacción'}</h1>
      <AlertMessage message={message} type="error" />
      <form onSubmit={handleSubmit} className="card card-body">
        <div className="mb-2">
          <label className="form-label">Lead *</label>
          <select className="form-select" name="leadId" value={form.leadId} onChange={handleChange} required disabled={isEdit}>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.nombre} — {l.empresa}</option>)}
          </select>
        </div>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Tipo</label>
            <select className="form-select" name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="llamada">llamada</option>
              <option value="whatsapp">whatsapp</option>
              <option value="email">email</option>
              <option value="reunion">reunion</option>
              <option value="nota">nota</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Dirección</label>
            <select className="form-select" name="direccion" value={form.direccion} onChange={handleChange}>
              <option value="saliente">saliente</option>
              <option value="entrante">entrante</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Resultado</label>
            <select className="form-select" name="resultado" value={form.resultado} onChange={handleChange}>
              <option value="sin_respuesta">sin_respuesta</option>
              <option value="respondio">respondio</option>
              <option value="interesado">interesado</option>
              <option value="no_interesa">no_interesa</option>
              <option value="pendiente">pendiente</option>
            </select>
          </div>
        </div>
        <div className="mb-2">
          <label className="form-label">Resumen *</label>
          <textarea className="form-control" name="resumen" value={form.resumen} onChange={handleChange} rows={2} required />
        </div>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Fecha interacción *</label>
            <input type="datetime-local" className="form-control" name="fechaInteraccion" value={form.fechaInteraccion} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Próxima acción (fecha)</label>
            <input type="datetime-local" className="form-control" name="proximaAccionFecha" value={form.proximaAccionFecha} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Duración (min)</label>
            <input type="number" className="form-control" name="duracionMin" value={form.duracionMin} onChange={handleChange} min={0} />
          </div>
        </div>
        <div className="mt-3">
          <button type="submit" className="btn btn-primary" disabled={!form.resumen.trim() || !form.leadId}>Guardar</button>
          <Link to="/interacciones" className="btn btn-secondary ms-2">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
