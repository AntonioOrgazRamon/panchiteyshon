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
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Tareas</h1>
      <a class="btn btn-primary" routerLink="/tareas/new">Nueva tarea</a>
    </div>
    <app-alert [message]="message()" [type]="messageType()" />
    <div class="btn-group mb-3" role="group">
      <button type="button" class="btn" [class.btn-primary]="viewMode() === 'lista'" [class.btn-outline-primary]="viewMode() !== 'lista'" (click)="setViewMode('lista')">Lista</button>
      <button type="button" class="btn" [class.btn-primary]="viewMode() === 'mes'" [class.btn-outline-primary]="viewMode() !== 'mes'" (click)="setViewMode('mes')">Mes</button>
      <button type="button" class="btn" [class.btn-primary]="viewMode() === 'semana'" [class.btn-outline-primary]="viewMode() !== 'semana'" (click)="setViewMode('semana')">Semana</button>
    </div>
    @if (viewMode() === 'mes' || viewMode() === 'semana') {
      @if (loadingCalendar()) {
        <app-loader />
      } @else {
        <app-tarea-calendar
          [tasks]="allTasksForCalendar()"
          [current]="calendarDate()"
          [view]="viewMode() === 'semana' ? 'semana' : 'mes'"
          (prev)="calendarPrev()"
          (next)="calendarNext()"
        />
      }
    }
    @if (viewMode() === 'lista') {
      <div class="card mb-3">
        <div class="row g-2 card-body">
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="estado" (ngModelChange)="load()">
              <option value="">Estado</option>
              <option value="pendiente">pendiente</option>
              <option value="en_progreso">en_progreso</option>
              <option value="hecha">hecha</option>
              <option value="cancelada">cancelada</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="prioridad" (ngModelChange)="load()">
              <option value="">Prioridad</option>
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
            </select>
          </div>
        </div>
      </div>
      @if (loading()) {
        <app-loader />
      } @else {
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Título</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Vencimiento</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (t of tareas(); track t.id) {
            <tr>
              <td>{{ t.titulo }}</td>
              <td>{{ t.tipo }}</td>
              <td>{{ t.estado }}</td>
              <td>{{ t.prioridad }}</td>
              <td>{{ t.fechaVencimiento | date:'shortDate' }}</td>
              <td>
                <a [routerLink]="['/tareas', t.id, 'edit']" class="btn btn-sm btn-outline-primary">Editar</a>
                <button type="button" class="btn btn-sm btn-outline-danger ms-1" (click)="confirmDelete(t)">Eliminar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <nav>
        <ul class="pagination">
          <li class="page-item" [class.disabled]="page() <= 1"><a class="page-link" (click)="setPage(page() - 1)">Anterior</a></li>
          <li class="page-item disabled"><span class="page-link">{{ page() }} / {{ totalPages() }}</span></li>
          <li class="page-item" [class.disabled]="page() >= totalPages()"><a class="page-link" (click)="setPage(page() + 1)">Siguiente</a></li>
        </ul>
      </nav>
    }
    }
    @if (tareaToDelete()) {
      <div class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Confirmar</h5><button type="button" class="btn-close" (click)="tareaToDelete.set(null)"></button></div>
            <div class="modal-body">¿Eliminar tarea {{ tareaToDelete()!.titulo }}?</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="tareaToDelete.set(null)">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="doDelete()">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
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
