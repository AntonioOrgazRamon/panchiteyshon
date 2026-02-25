import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Tarea } from '../services/tareaService';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type ViewMode = 'mes' | 'semana';

type Props = {
  tasks: Tarea[];
  current: Date;
  view: ViewMode;
  onPrev: () => void;
  onNext: () => void;
};

function getWeekStart(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function tasksByDate(tasks: Tarea[]): Map<string, Tarea[]> {
  const map = new Map<string, Tarea[]>();
  for (const t of tasks) {
    const d = t.fechaVencimiento || t.fechaRecordatorio;
    if (!d) continue;
    const key = new Date(d).toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return map;
}

export default function TareaCalendar({ tasks, current, view, onPrev, onNext }: Props) {
  const map = useMemo(() => tasksByDate(tasks), [tasks]);

  const title = useMemo(() => {
    if (view === 'semana') {
      const start = getWeekStart(current);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('es', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return current.toLocaleDateString('es', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
  }, [current, view]);

  const monthGrid = useMemo(() => {
    const d = new Date(current.getFullYear(), current.getMonth(), 1);
    const first = new Date(d);
    const dayOfWeek = first.getDay() === 0 ? 6 : first.getDay() - 1;
    first.setDate(first.getDate() - dayOfWeek);
    const grid: { key: string; day: number; isCurrentMonth: boolean; tasks: Tarea[] }[][] = [];
    const month = current.getMonth();
    for (let w = 0; w < 6; w++) {
      const week: { key: string; day: number; isCurrentMonth: boolean; tasks: Tarea[] }[] = [];
      for (let i = 0; i < 7; i++) {
        const cellDate = new Date(first);
        cellDate.setDate(first.getDate() + w * 7 + i);
        const key = cellDate.toISOString().slice(0, 10);
        week.push({
          key: key + w + i,
          day: cellDate.getDate(),
          isCurrentMonth: cellDate.getMonth() === month,
          tasks: map.get(key) || [],
        });
      }
      grid.push(week);
    }
    return grid;
  }, [current, map]);

  const weekDays = useMemo(() => {
    const start = getWeekStart(current);
    const out: { key: string; day: number; weekday: string; tasks: Tarea[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + i);
      const key = cell.toISOString().slice(0, 10);
      const dayTasks = (map.get(key) || []).sort((a, b) => {
        const ta = (a.fechaVencimiento || a.fechaRecordatorio) ? new Date(a.fechaVencimiento || a.fechaRecordatorio!).getTime() : 0;
        const tb = (b.fechaVencimiento || b.fechaRecordatorio) ? new Date(b.fechaVencimiento || b.fechaRecordatorio!).getTime() : 0;
        return ta - tb;
      });
      out.push({ key, day: cell.getDate(), weekday: WEEKDAYS[i], tasks: dayTasks });
    }
    return out;
  }, [current, map]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onPrev}>‹ Anterior</button>
        <strong>{title}</strong>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onNext}>Siguiente ›</button>
      </div>
      {view === 'mes' && (
        <div className="calendar-month border rounded">
          <div className="calendar-weekdays row g-0 text-center small text-muted border-bottom">
            {WEEKDAYS.map((w) => (
              <div key={w} className="col calendar-cell">{w}</div>
            ))}
          </div>
          {monthGrid.map((week) => (
            <div key={week[0].key} className="calendar-week row g-0 border-bottom">
              {week.map((day) => (
                <div key={day.key} className={`col calendar-cell border-end p-1 min-h-calendar ${!day.isCurrentMonth ? 'bg-light' : ''}`} style={{ minHeight: '90px' }}>
                  <span className={`small ${!day.isCurrentMonth ? 'text-muted' : ''}`}>{day.day}</span>
                  {day.tasks.map((t) => (
                    <div key={t.id} className="small">
                      <Link to={`/tareas/${t.id}/edit`} className={`text-decoration-none ${t.estado === 'hecha' ? 'text-decoration-line-through text-muted' : ''}`}>{t.titulo}</Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {view === 'semana' && (
        <div className="calendar-week-view border rounded">
          <div className="row g-0 text-center border-bottom bg-light">
            {weekDays.map((d) => (
              <div key={d.key} className="col p-2 border-end">
                <div className="small text-muted">{d.weekday}</div>
                <strong>{d.day}</strong>
              </div>
            ))}
          </div>
          <div className="row g-0">
            {weekDays.map((d) => (
              <div key={d.key} className="col border-end p-2" style={{ minHeight: '200px' }}>
                {d.tasks.map((t) => (
                  <div key={t.id} className="small mb-1">
                    <Link to={`/tareas/${t.id}/edit`} className={`text-decoration-none ${t.estado === 'hecha' ? 'text-decoration-line-through text-muted' : ''}`}>{t.titulo}</Link>
                    <span className="badge bg-secondary ms-1">{t.prioridad}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
