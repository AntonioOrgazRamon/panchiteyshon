import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService, Cliente } from '../../services/cliente.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, AlertComponent],
  template: `
    <app-alert [message]="errorMessage()" type="error" />
    @if (loading()) {
      <app-loader />
    } @else if (cliente()) {
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>{{ cliente()!.nombreContacto }} — {{ cliente()!.empresa }}</h1>
        <div>
          <a [routerLink]="['/clientes', cliente()!.id, 'edit']" class="btn btn-primary me-2">Editar</a>
          <a routerLink="/clientes" class="btn btn-outline-secondary">Volver</a>
        </div>
      </div>
      <div class="card mb-3">
        <div class="card-body">
          <p><strong>Teléfono:</strong> {{ cliente()!.telefono }}</p>
          <p><strong>Email:</strong> {{ cliente()!.email || '-' }}</p>
          <p><strong>Ciudad:</strong> {{ cliente()!.ciudad || '-' }}</p>
          <p><strong>Web:</strong> {{ cliente()!.web || '-' }}</p>
          <p><strong>Estado:</strong> <span class="badge bg-{{ cliente()!.estadoCliente === 'activo' ? 'success' : cliente()!.estadoCliente === 'pausado' ? 'warning' : 'secondary' }}">{{ cliente()!.estadoCliente }}</span></p>
          <p><strong>MRR:</strong> {{ cliente()!.mrr != null ? (cliente()!.mrr | number) : '-' }}</p>
          <p><strong>Fecha alta:</strong> {{ cliente()!.fechaAlta | date:'shortDate' }}</p>
          <p><strong>Última interacción:</strong> {{ cliente()!.ultimaInteraccion ? (cliente()!.ultimaInteraccion | date:'short') : '-' }}</p>
          <p><strong>Próxima revisión:</strong> {{ cliente()!.proximaRevision ? (cliente()!.proximaRevision | date:'short') : '-' }}</p>
          @if (cliente()!.serviciosContratados?.length) {
            <p><strong>Servicios:</strong> {{ cliente()!.serviciosContratados!.join(', ') }}</p>
          }
          @if (cliente()!.leadOrigenId) {
            <p><strong>Lead origen:</strong> <a [routerLink]="['/leads', cliente()!.leadOrigenId]">Ver lead</a></p>
          }
          @if (cliente()!.observacionesInternas) {
            <p><strong>Observaciones internas:</strong><br />{{ cliente()!.observacionesInternas }}</p>
          }
        </div>
      </div>
      <h5>Tareas asociadas</h5>
      @if (tareas().length === 0) {
        <p class="text-muted">Sin tareas.</p>
      } @else {
        <table class="table table-sm">
          <thead><tr><th>Título</th><th>Estado</th><th>Vencimiento</th><th></th></tr></thead>
          <tbody>
            @for (t of tareas(); track t.id) {
              <tr>
                <td>{{ t.titulo }}</td>
                <td>{{ t.estado }}</td>
                <td>{{ t.fechaVencimiento | date:'shortDate' }}</td>
                <td><a [routerLink]="['/tareas', t.id, 'edit']">Editar</a></td>
              </tr>
            }
          </tbody>
        </table>
      }
      <a [routerLink]="['/tareas/new']" [queryParams]="{ clienteId: cliente()!.id }" class="btn btn-outline-primary">Nueva tarea</a>
    }
  `,
})
export class ClienteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clienteService = inject(ClienteService);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  cliente = signal<Cliente | null>(null);
  tareas = signal<{ id: string; titulo: string; estado: string; fechaVencimiento?: string }[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.clienteService.getById(id).subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.cliente.set(r.data);
        this.clienteService.getTareas(id).subscribe((rt) => {
          if (rt.ok && rt.data) this.tareas.set(rt.data as any);
        });
      } else {
        this.errorMessage.set(r.message || 'Cliente no encontrado');
      }
    });
  }
}
