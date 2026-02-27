import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TareaService, Tarea } from '../../services/tarea.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';
import { TareaCalendarComponent } from './tarea-calendar.component';

@Component({
  selector: 'app-tarea-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LoaderComponent, AlertComponent, DatePipe, TareaCalendarComponent],
  templateUrl: './tarea-list.component.html',
})
export class TareaListComponent implements OnInit {
  loading = signal(true);
  tareas = signal<Tarea[]>([]);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('error');
  page = signal(1);
  limit = 10;
  total = signal(0);
  totalPages = () => Math.max(1, Math.ceil(this.total() / this.limit));
  estado = '';
  prioridad = '';
  leadId = '';
  tareaToDelete = signal<Tarea | null>(null);
  viewMode = signal<'lista' | 'mes' | 'semana'>('lista');
  calendarDate = signal(new Date());
  allTasksForCalendar = signal<Tarea[]>([]);
  loadingCalendar = signal(false);

  constructor(private service: TareaService) {}

  ngOnInit() { this.load(); }

  setViewMode(mode: 'lista' | 'mes' | 'semana') {
    this.viewMode.set(mode);
    if (mode === 'mes' || mode === 'semana') this.loadCalendar();
  }

  loadCalendar() {
    this.loadingCalendar.set(true);
    this.service.getAll().subscribe((r) => {
      this.loadingCalendar.set(false);
      if (r.ok && r.data) this.allTasksForCalendar.set(r.data);
    });
  }

  calendarPrev() {
    const d = new Date(this.calendarDate());
    if (this.viewMode() === 'mes') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    this.calendarDate.set(d);
  }

  calendarNext() {
    const d = new Date(this.calendarDate());
    if (this.viewMode() === 'mes') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    this.calendarDate.set(d);
  }

  load() {
    this.loading.set(true);
    this.service.getPaginated({
      page: this.page(),
      limit: this.limit,
      estado: this.estado,
      prioridad: this.prioridad,
      leadId: this.leadId,
    }).subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.tareas.set(r.data);
        if (r.meta && typeof r.meta['total'] === 'number') this.total.set(r.meta['total']);
      }
    });
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  confirmDelete(t: Tarea) { this.tareaToDelete.set(t); }

  doDelete() {
    const t = this.tareaToDelete();
    if (!t) return;
    this.service.delete(t.id).subscribe((r) => {
      this.tareaToDelete.set(null);
      if (r.ok) { this.message.set('Tarea eliminada'); this.messageType.set('success'); this.load(); }
      else { this.message.set(r.message || 'Error'); this.messageType.set('error'); }
    });
  }
}
