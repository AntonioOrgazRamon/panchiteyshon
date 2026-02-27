import { Component, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import type { Tarea } from '../../services/tarea.service';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

@Component({
  selector: 'app-tarea-calendar',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './tarea-calendar.component.html',
  styleUrls: ['./tarea-calendar.component.css'],
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
