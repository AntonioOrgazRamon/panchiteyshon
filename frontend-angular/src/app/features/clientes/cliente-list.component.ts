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
  templateUrl: './cliente-list.component.html',
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
