import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LeadService, Lead } from '../../services/lead.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, LoaderComponent, AlertComponent],
  template: `
    <app-alert [message]="errorMessage()" type="error" />
    @if (loading()) {
      <app-loader />
    } @else if (lead()) {
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>{{ lead()!.nombre }} — {{ lead()!.empresa }}</h1>
        <div>
          @if (lead()!.clienteId) {
            <a [routerLink]="['/clientes', lead()!.clienteId]" class="btn btn-success me-2">Ver cliente creado</a>
          } @else {
            <button type="button" class="btn btn-success me-2" (click)="convertirCliente()" [disabled]="converting()">Convertir en cliente</button>
          }
          <a [routerLink]="['/leads', lead()!.id, 'edit']" class="btn btn-primary me-2">Editar</a>
          <a routerLink="/leads" class="btn btn-outline-secondary">Volver</a>
        </div>
      </div>
      @if (lead()!.clienteId) {
        <div class="alert alert-info">Este lead fue convertido en cliente. <a [routerLink]="['/clientes', lead()!.clienteId]">Ver cliente</a></div>
      }
      <div class="card mb-3">
        <div class="card-body">
          <p><strong>Teléfono:</strong> {{ lead()!.telefono }}</p>
          <p><strong>Email:</strong> {{ lead()!.email || '-' }}</p>
          <p><strong>Canal origen:</strong> {{ lead()!.canalOrigen }}</p>
          <p><strong>Estado pipeline:</strong> <span class="badge badge-pipeline-{{ lead()!.estadoPipeline }}">{{ lead()!.estadoPipeline }}</span></p>
          <p><strong>Prioridad:</strong> {{ lead()!.prioridad }}</p>
          <p><strong>Ticket estimado:</strong> {{ lead()!.ticketEstimado }}</p>
          <p><strong>Localidad:</strong> {{ lead()!.localidad || '-' }}</p>
          <p><strong>Activo:</strong> {{ lead()!.activo ? 'Sí' : 'No' }}</p>
          <p><strong>Último contacto:</strong> {{ lead()!.ultimoContacto ? (lead()!.ultimoContacto | date:'short') : '-' }}</p>
          @if (lead()!.notas) {
            <p><strong>Notas:</strong> {{ lead()!.notas }}</p>
          }
        </div>
      </div>
      <h5>Interacciones</h5>
      @if (interacciones().length === 0) {
        <p class="text-muted">Sin interacciones.</p>
      } @else {
        <table class="table table-sm">
          <thead><tr><th>Tipo</th><th>Resumen</th><th>Resultado</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            @for (i of interacciones(); track i.id) {
              <tr>
                <td>{{ i.tipo }}</td>
                <td>{{ i.resumen }}</td>
                <td>{{ i.resultado }}</td>
                <td>{{ i.fechaInteraccion | date:'short' }}</td>
                <td><a [routerLink]="['/interacciones', i.id, 'edit']">Editar</a></td>
              </tr>
            }
          </tbody>
        </table>
      }
      <h5 class="mt-3">Tareas</h5>
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
      <a [routerLink]="['/interacciones/new']" [queryParams]="{ leadId: lead()!.id }" class="btn btn-outline-primary me-2">Nueva interacción</a>
      <a [routerLink]="['/tareas/new']" [queryParams]="{ leadId: lead()!.id }" class="btn btn-outline-primary">Nueva tarea</a>
    }
  `,
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private leadService = inject(LeadService);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  lead = signal<Lead | null>(null);
  interacciones = signal<{ id: string; tipo: string; resumen: string; resultado: string; fechaInteraccion: string }[]>([]);
  tareas = signal<{ id: string; titulo: string; estado: string; fechaVencimiento?: string }[]>([]);
  converting = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.leadService.getById(id).subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.lead.set(r.data);
        this.leadService.getInteracciones(id).subscribe((ri) => {
          if (ri.ok && ri.data) this.interacciones.set(ri.data as any);
        });
        this.leadService.getTareas(id).subscribe((rt) => {
          if (rt.ok && rt.data) this.tareas.set(rt.data as any);
        });
      } else {
        this.errorMessage.set(r.message || 'Lead no encontrado');
      }
    });
  }

  convertirCliente() {
    const l = this.lead();
    if (!l || l.clienteId) return;
    this.converting.set(true);
    this.leadService.convertToCliente(l.id).subscribe((r) => {
      this.converting.set(false);
      if (r.ok && r.data) {
        const clienteId = (r.data as any)?.id ?? (r as any).meta?.clienteId;
        this.lead.set({ ...l, clienteId });
        this.leadService.getById(l.id).subscribe((refetch) => {
          if (refetch.ok && refetch.data) this.lead.set(refetch.data);
        });
      } else {
        this.errorMessage.set(r.message || 'Error al convertir');
      }
    });
  }
}
