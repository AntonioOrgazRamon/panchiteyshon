import { Component, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import type { Tarea } from '../../services/tarea.service';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

@Component({
  selector: 'app-tarea-calendar',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="prev.emit()">‹ Anterior</button>
      <strong>{{ title() }}</strong>
      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="next.emit()">Siguiente ›</button>
    </div>
    @if (view() === 'mes') {
      <div class="calendar-month border rounded">
        <div class="calendar-weekdays row g-0 text-center small text-muted border-bottom">
          @for (w of weekdays; track w) {
            <div class="col calendar-cell">{{ w }}</div>
          }
        </div>
        @for (week of monthGrid(); track week[0].key) {
          <div class="calendar-week row g-0 border-bottom">
            @for (day of week; track day.key) {
              <div class="col calendar-cell border-end p-1 min-h-calendar" [class.bg-light]="!day.isCurrentMonth">
                <span class="small" [class.text-muted]="!day.isCurrentMonth">{{ day.day }}</span>
                @for (t of day.tasks; track t.id) {
                  <div class="small">
                    <a [routerLink]="['/tareas', t.id, 'edit']" class="text-decoration-none" [class.text-decoration-line-through]="t.estado === 'hecha'" [class.text-muted]="t.estado === 'hecha'">{{ t.titulo }}</a>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    }
    @if (view() === 'semana') {
      <div class="calendar-week-view border rounded">
        <div class="row g-0 text-center border-bottom bg-light">
          @for (d of weekDays(); track d.key) {
            <div class="col p-2 border-end">
              <div class="small text-muted">{{ d.weekday }}</div>
              <strong>{{ d.day }}</strong>
            </div>
          }
        </div>
        <div class="row g-0">
          @for (d of weekDays(); track d.key) {
            <div class="col border-end p-2 min-h-week">
              @for (t of d.tasks; track t.id) {
                <div class="small mb-1">
                  <a [routerLink]="['/tareas', t.id, 'edit']" class="text-decoration-none" [class.text-decoration-line-through]="t.estado === 'hecha'" [class.text-muted]="t.estado === 'hecha'">{{ t.titulo }}</a>
                  <span class="badge bg-secondary ms-1">{{ t.prioridad }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .calendar-cell { min-height: 80px; }
    .min-h-calendar { min-height: 90px; }
    .min-h-week { min-height: 200px; }
  `],
})
export class TareaCalendarComponent {
  readonly tasks = input.required<Tarea[]>();
  readonly current = input.required<Date>();
  readonly view = input<'mes' | 'semana'>('mes');
  readonly prev = output<void>();
  readonly next = output<void>();

  weekdays = WEEKDAYS;

  private tasksByDate = computed(() => {
    const map = new Map<string, Tarea[]>();
    for (const t of this.tasks()) {
      const d = t.fechaVencimiento || t.fechaRecordatorio;
      if (!d) continue;
      const key = new Date(d).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  });

  title = computed(() => {
    const d = this.current();
    const month = d.toLocaleDateString('es', { month: 'long', year: 'numeric' });
    if (this.view() === 'semana') {
      const start = this.getWeekStart(d);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return start.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + ' – ' + end.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return month.charAt(0).toUpperCase() + month.slice(1);
  });

  private getWeekStart(d: Date): Date {
    const x = new Date(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  monthGrid = computed(() => {
    const d = new Date(this.current().getFullYear(), this.current().getMonth(), 1);
    const first = new Date(d);
    const dayOfWeek = first.getDay() === 0 ? 6 : first.getDay() - 1;
    first.setDate(first.getDate() - dayOfWeek);
    const grid: { key: string; day: number; isCurrentMonth: boolean; tasks: Tarea[] }[][] = [];
    const month = this.current().getMonth();
    const map = this.tasksByDate();
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
  });

  weekDays = computed(() => {
    const d = new Date(this.current());
    const start = this.getWeekStart(d);
    const map = this.tasksByDate();
    const out: { key: string; day: number; weekday: string; tasks: Tarea[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + i);
      const key = cell.toISOString().slice(0, 10);
      out.push({
        key,
        day: cell.getDate(),
        weekday: WEEKDAYS[i],
        tasks: (map.get(key) || []).sort((a, b) => {
          const ta = (a.fechaVencimiento || a.fechaRecordatorio) ? new Date(a.fechaVencimiento || a.fechaRecordatorio!).getTime() : 0;
          const tb = (b.fechaVencimiento || b.fechaRecordatorio) ? new Date(b.fechaVencimiento || b.fechaRecordatorio!).getTime() : 0;
          return ta - tb;
        }),
      });
    }
    return out;
  });
}
