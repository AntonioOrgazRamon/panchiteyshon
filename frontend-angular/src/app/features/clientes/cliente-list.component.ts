import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService, Cliente } from '../../services/cliente.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

const ESTADOS = ['activo', 'pausado', 'finalizado'];

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoaderComponent, AlertComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Clientes</h1>
      <a class="btn btn-primary" routerLink="/clientes/new">Nuevo cliente</a>
    </div>
    <app-alert [message]="message()" [type]="messageType()" />
    <div class="row g-2 mb-3">
      <div class="col-auto"><span class="badge bg-success">Activos: {{ kpiActivos() }}</span></div>
      <div class="col-auto"><span class="badge bg-warning text-dark">Pausados: {{ kpiPausados() }}</span></div>
      <div class="col-auto"><span class="badge bg-secondary">Finalizados: {{ kpiFinalizados() }}</span></div>
      @if (kpiMrr() > 0) {
        <div class="col-auto"><span class="badge bg-info">MRR total: {{ kpiMrr() | number }}</span></div>
      }
    </div>
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-3">
            <input type="text" class="form-control" placeholder="Buscar..." [(ngModel)]="search" (ngModelChange)="load()" />
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="estadoCliente" (ngModelChange)="load()">
              <option value="">Estado</option>
              @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
            </select>
          </div>
          <div class="col-md-2">
            <input type="text" class="form-control" placeholder="Servicio" [(ngModel)]="servicio" (ngModelChange)="load()" />
          </div>
        </div>
      </div>
    </div>
    @if (loading()) {
      <app-loader />
    } @else {
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Contacto</th>
            <th>Empresa</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>MRR</th>
            <th>Próx. revisión</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (c of clientes(); track c.id) {
            <tr>
              <td>{{ c.nombreContacto }}</td>
              <td>{{ c.empresa }}</td>
              <td>{{ c.telefono }}</td>
              <td><span class="badge bg-{{ c.estadoCliente === 'activo' ? 'success' : c.estadoCliente === 'pausado' ? 'warning' : 'secondary' }}">{{ c.estadoCliente }}</span></td>
              <td>{{ c.mrr != null ? (c.mrr | number) : '-' }}</td>
              <td>{{ c.proximaRevision ? (c.proximaRevision | date:'shortDate') : '-' }}</td>
              <td>
                <a [routerLink]="['/clientes', c.id]" class="btn btn-sm btn-outline-primary me-1">Ver</a>
                <a [routerLink]="['/clientes', c.id, 'edit']" class="btn btn-sm btn-outline-secondary me-1">Editar</a>
                <button type="button" class="btn btn-sm btn-outline-danger" (click)="confirmDelete(c)">Eliminar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <nav>
        <ul class="pagination">
          <li class="page-item" [class.disabled]="page() <= 1">
            <a class="page-link" (click)="setPage(page() - 1)">Anterior</a>
          </li>
          <li class="page-item disabled"><span class="page-link">{{ page() }} / {{ totalPages() }}</span></li>
          <li class="page-item" [class.disabled]="page() >= totalPages()">
            <a class="page-link" (click)="setPage(page() + 1)">Siguiente</a>
          </li>
        </ul>
      </nav>
    }
    @if (clienteToDelete()) {
      <div class="modal show d-block" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmar eliminación</h5>
              <button type="button" class="btn-close" (click)="clienteToDelete.set(null)"></button>
            </div>
            <div class="modal-body">¿Eliminar cliente {{ clienteToDelete()!.nombreContacto }} ({{ clienteToDelete()!.empresa }})?</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="clienteToDelete.set(null)">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="doDelete()">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ClienteListComponent implements OnInit {
  loading = signal(true);
  clientes = signal<Cliente[]>([]);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error' | 'info'>('info');
  page = signal(1);
  limit = 10;
  total = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  search = '';
  estadoCliente = '';
  servicio = '';
  clienteToDelete = signal<Cliente | null>(null);
  kpiActivos = signal(0);
  kpiPausados = signal(0);
  kpiFinalizados = signal(0);
  kpiMrr = signal(0);
  estados = ESTADOS;

  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.loadKpis();
    this.load();
  }

  loadKpis() {
    this.clienteService.getAll().subscribe((r) => {
      if (r.ok && r.data) {
        this.kpiActivos.set(r.data.filter((c) => c.estadoCliente === 'activo').length);
        this.kpiPausados.set(r.data.filter((c) => c.estadoCliente === 'pausado').length);
        this.kpiFinalizados.set(r.data.filter((c) => c.estadoCliente === 'finalizado').length);
        this.kpiMrr.set(r.data.reduce((acc, c) => acc + (c.mrr ?? 0), 0));
      }
    });
  }

  load() {
    this.loading.set(true);
    this.clienteService.getPaginated({
      page: this.page(),
      limit: this.limit,
      search: this.search,
      estadoCliente: this.estadoCliente,
      servicio: this.servicio,
    }).subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.clientes.set(r.data);
        if (r.meta && typeof r.meta['total'] === 'number') this.total.set(r.meta['total']);
      } else {
        this.message.set(r.message || 'Error al cargar');
        this.messageType.set('error');
      }
    });
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  confirmDelete(cliente: Cliente) {
    this.clienteToDelete.set(cliente);
  }

  doDelete() {
    const c = this.clienteToDelete();
    if (!c) return;
    this.clienteService.delete(c.id).subscribe((r) => {
      this.clienteToDelete.set(null);
      if (r.ok) {
        this.message.set('Cliente eliminado');
        this.messageType.set('success');
        this.load();
      } else {
        this.message.set(r.message || 'Error');
        this.messageType.set('error');
      }
    });
  }
}
