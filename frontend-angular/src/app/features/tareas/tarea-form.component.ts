import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TareaService } from '../../services/tarea.service';
import { LeadService, Lead } from '../../services/lead.service';
import { ClienteService, Cliente } from '../../services/cliente.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

@Component({
  selector: 'app-tarea-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoaderComponent, AlertComponent],
  template: `
    <h1>{{ isEdit() ? 'Editar tarea' : 'Nueva tarea' }}</h1>
    <app-alert [message]="message()" type="error" />
    @if (loading()) {
      <app-loader />
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()" class="card card-body">
        <div class="mb-2">
          <label class="form-label">Título *</label>
          <input type="text" class="form-control" formControlName="titulo" />
          @if (form.get('titulo')?.invalid && form.get('titulo')?.touched) {
            <small class="text-danger">Título requerido</small>
          }
        </div>
        <div class="mb-2">
          <label class="form-label">Descripción</label>
          <textarea class="form-control" formControlName="descripcion" rows="2"></textarea>
        </div>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label">Tipo</label>
            <select class="form-select" formControlName="tipo">
              <option value="seguimiento">seguimiento</option>
              <option value="reunion">reunion</option>
              <option value="interna">interna</option>
              <option value="recordatorio">recordatorio</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Estado</label>
            <select class="form-select" formControlName="estado">
              <option value="pendiente">pendiente</option>
              <option value="en_progreso">en_progreso</option>
              <option value="hecha">hecha</option>
              <option value="cancelada">cancelada</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Prioridad</label>
            <select class="form-select" formControlName="prioridad">
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
            </select>
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label">Lead</label>
            <select class="form-select" formControlName="leadId">
              <option [value]="null">— Sin lead —</option>
              @for (l of leads(); track l.id) {
                <option [value]="l.id">{{ l.nombre }} — {{ l.empresa }}</option>
              }
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Cliente</label>
            <select class="form-select" formControlName="clienteId">
              <option [value]="null">— Sin cliente —</option>
              @for (c of clientes(); track c.id) {
                <option [value]="c.id">{{ c.nombreContacto }} — {{ c.empresa }}</option>
              }
            </select>
          </div>
        </div>
        <div class="mb-2">
          <label class="form-label">Categoría planificación</label>
          <select class="form-select" formControlName="categoriaPlanificacion">
            <option value="puntual">puntual</option>
            <option value="diaria">diaria</option>
            <option value="semanal">semanal</option>
          </select>
        </div>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label">Fecha vencimiento</label>
            <input type="date" class="form-control" formControlName="fechaVencimiento" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Fecha recordatorio</label>
            <input type="date" class="form-control" formControlName="fechaRecordatorio" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Completada</label>
            <div class="form-check mt-2">
              <input type="checkbox" class="form-check-input" formControlName="completada" />
            </div>
          </div>
        </div>
        <div class="mt-3">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
          <a routerLink="/tareas" class="btn btn-secondary ms-2">Cancelar</a>
        </div>
      </form>
    }
  `,
})
export class TareaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(TareaService);
  private leadService = inject(LeadService);
  private clienteService = inject(ClienteService);

  form!: FormGroup;
  loading = signal(true);
  message = signal<string | null>(null);
  isEdit = signal(false);
  id = signal<string | null>(null);
  leads = signal<Lead[]>([]);
  clientes = signal<Cliente[]>([]);

  ngOnInit() {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      tipo: ['seguimiento'],
      estado: ['pendiente'],
      prioridad: ['media'],
      leadId: [null as string | null],
      clienteId: [null as string | null],
      categoriaPlanificacion: ['puntual'],
      fechaVencimiento: [''],
      fechaRecordatorio: [''],
      completada: [false],
    });
    this.leadService.getAll().subscribe((r) => {
      if (r.ok && r.data) this.leads.set(r.data);
    });
    this.clienteService.getAll().subscribe((r) => {
      if (r.ok && r.data) this.clientes.set(r.data);
    });
    const id = this.route.snapshot.paramMap.get('id');
    const leadId = this.route.snapshot.queryParamMap.get('leadId');
    const clienteId = this.route.snapshot.queryParamMap.get('clienteId');
    if (leadId) this.form.patchValue({ leadId, clienteId: null });
    if (clienteId) this.form.patchValue({ clienteId, leadId: null });
    if (id && id !== 'new') {
      this.id.set(id);
      this.isEdit.set(true);
      this.service.getById(id).subscribe((r) => {
        this.loading.set(false);
        if (r.ok && r.data) {
          const d = r.data;
          this.form.patchValue({
            titulo: d.titulo,
            descripcion: d.descripcion ?? '',
            tipo: d.tipo,
            estado: d.estado,
            prioridad: d.prioridad,
            leadId: d.leadId ?? null,
            clienteId: d.clienteId ?? null,
            categoriaPlanificacion: d.categoriaPlanificacion ?? 'puntual',
            fechaVencimiento: d.fechaVencimiento ? d.fechaVencimiento.toString().slice(0, 10) : '',
            fechaRecordatorio: d.fechaRecordatorio ? d.fechaRecordatorio.toString().slice(0, 10) : '',
            completada: d.completada,
          });
        } else this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  submit() {
    this.message.set(null);
    const raw = this.form.value;
    const payload = {
      titulo: raw.titulo,
      descripcion: raw.descripcion || '',
      tipo: raw.tipo,
      estado: raw.estado,
      prioridad: raw.prioridad,
      leadId: raw.leadId || null,
      clienteId: raw.clienteId || null,
      categoriaPlanificacion: raw.categoriaPlanificacion || 'puntual',
      fechaVencimiento: raw.fechaVencimiento ? new Date(raw.fechaVencimiento).toISOString() : null,
      fechaRecordatorio: raw.fechaRecordatorio ? new Date(raw.fechaRecordatorio).toISOString() : null,
      completada: !!raw.completada,
    };
    const id = this.id();
    if (id) {
      this.service.update(id, payload, true).subscribe((r) => {
        if (r.ok) this.router.navigate(['/tareas']);
        else this.message.set(r.message || 'Error');
      });
    } else {
      this.service.create(payload).subscribe((r) => {
        if (r.ok) this.router.navigate(['/tareas']);
        else this.message.set(r.message || 'Error');
      });
    }
  }
}
