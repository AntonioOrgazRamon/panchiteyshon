import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InteraccionService, Interaccion } from '../../services/interaccion.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-interaccion-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LoaderComponent, AlertComponent, DatePipe, SlicePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Interacciones</h1>
      <a class="btn btn-primary" routerLink="/interacciones/new">Nueva interacción</a>
    </div>
    <app-alert [message]="message()" [type]="messageType()" />
    <div class="card mb-3">
      <div class="row g-2 card-body">
        <div class="col-md-2">
          <input type="text" class="form-control" placeholder="Lead ID" [(ngModel)]="leadId" (ngModelChange)="load()" />
        </div>
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="tipo" (ngModelChange)="load()">
            <option value="">Tipo</option>
            <option value="llamada">llamada</option>
            <option value="whatsapp">whatsapp</option>
            <option value="email">email</option>
            <option value="reunion">reunion</option>
            <option value="nota">nota</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select" [(ngModel)]="resultado" (ngModelChange)="load()">
            <option value="">Resultado</option>
            <option value="sin_respuesta">sin_respuesta</option>
            <option value="respondio">respondio</option>
            <option value="interesado">interesado</option>
            <option value="no_interesa">no_interesa</option>
            <option value="pendiente">pendiente</option>
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
            <th>Lead ID</th>
            <th>Tipo</th>
            <th>Resumen</th>
            <th>Resultado</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (i of items(); track i.id) {
            <tr>
              <td><a [routerLink]="['/leads', i.leadId]">{{ i.leadId | slice:0:8 }}...</a></td>
              <td>{{ i.tipo }}</td>
              <td>{{ i.resumen | slice:0:40 }}{{ i.resumen.length > 40 ? '...' : '' }}</td>
              <td>{{ i.resultado }}</td>
              <td>{{ i.fechaInteraccion | date:'short' }}</td>
              <td>
                <a [routerLink]="['/interacciones', i.id, 'edit']" class="btn btn-sm btn-outline-primary me-1">Editar</a>
                <button type="button" class="btn btn-sm btn-outline-danger" (click)="confirmDelete(i)">Eliminar</button>
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
    @if (itemToDelete()) {
      <div class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Confirmar</h5><button type="button" class="btn-close" (click)="itemToDelete.set(null)"></button></div>
            <div class="modal-body">¿Eliminar esta interacción?</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="itemToDelete.set(null)">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="doDelete()">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class InteraccionListComponent implements OnInit {
  loading = signal(true);
  items = signal<Interaccion[]>([]);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('error');
  page = signal(1);
  limit = 10;
  total = signal(0);
  totalPages = () => Math.max(1, Math.ceil(this.total() / this.limit));
  leadId = '';
  tipo = '';
  resultado = '';
  itemToDelete = signal<Interaccion | null>(null);

  constructor(private service: InteraccionService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getPaginated({
      page: this.page(),
      limit: this.limit,
      leadId: this.leadId,
      tipo: this.tipo,
      resultado: this.resultado,
    }).subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.items.set(r.data);
        if (r.meta && typeof r.meta['total'] === 'number') this.total.set(r.meta['total']);
      }
    });
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  confirmDelete(i: Interaccion) { this.itemToDelete.set(i); }

  doDelete() {
    const i = this.itemToDelete();
    if (!i) return;
    this.service.delete(i.id).subscribe((r) => {
      this.itemToDelete.set(null);
      if (r.ok) { this.message.set('Eliminada'); this.messageType.set('success'); this.load(); }
      else { this.message.set(r.message || 'Error'); this.messageType.set('error'); }
    });
  }
}
