import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeadService, Lead } from '../../services/lead.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

const CANALES = ['whatsapp', 'instagram', 'llamada', 'web', 'referido', 'otro'];
const ESTADOS = ['nuevo', 'contactado', 'interesado', 'reunion', 'propuesta', 'cerrado', 'perdido'];
const PRIORIDADES = ['baja', 'media', 'alta'];

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoaderComponent, AlertComponent],
  template: `
    <h1>{{ isEdit() ? 'Editar lead' : 'Nuevo lead' }}</h1>
    <app-alert [message]="message()" type="error" />
    @if (loading()) {
      <app-loader />
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()" class="card card-body">
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label">Nombre *</label>
            <input type="text" class="form-control" formControlName="nombre" />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <small class="text-danger">Nombre requerido</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Empresa *</label>
            <input type="text" class="form-control" formControlName="empresa" />
            @if (form.get('empresa')?.invalid && form.get('empresa')?.touched) {
              <small class="text-danger">Empresa requerida</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Teléfono *</label>
            <input type="text" class="form-control" formControlName="telefono" />
            @if (form.get('telefono')?.invalid && form.get('telefono')?.touched) {
              <small class="text-danger">Teléfono requerido</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <small class="text-danger">Email inválido</small>
            }
          </div>
          <div class="col-md-4">
            <label class="form-label">Canal origen</label>
            <select class="form-select" formControlName="canalOrigen">
              @for (c of canales; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Estado pipeline</label>
            <select class="form-select" formControlName="estadoPipeline">
              @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Prioridad</label>
            <select class="form-select" formControlName="prioridad">
              @for (p of prioridades; track p) { <option [value]="p">{{ p }}</option> }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Ticket estimado *</label>
            <input type="number" class="form-control" formControlName="ticketEstimado" min="0" />
            @if (form.get('ticketEstimado')?.invalid && form.get('ticketEstimado')?.touched) {
              <small class="text-danger">Debe ser &gt;= 0</small>
            }
          </div>
          <div class="col-md-4">
            <label class="form-label">Localidad</label>
            <input type="text" class="form-control" formControlName="localidad" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Activo</label>
            <div class="form-check mt-2">
              <input type="checkbox" class="form-check-input" formControlName="activo" />
              <label class="form-check-label">Activo</label>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label">Notas</label>
            <textarea class="form-control" formControlName="notas" rows="2"></textarea>
          </div>
        </div>
        <div class="mt-3">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
          <a routerLink="/leads" class="btn btn-secondary ms-2">Cancelar</a>
        </div>
      </form>
    }
  `,
})
export class LeadFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private leadService = inject(LeadService);

  form!: FormGroup;
  loading = signal(true);
  message = signal<string | null>(null);
  isEdit = signal(false);
  id = signal<string | null>(null);
  canales = CANALES;
  estados = ESTADOS;
  prioridades = PRIORIDADES;

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      empresa: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.email]],
      canalOrigen: ['otro'],
      estadoPipeline: ['nuevo'],
      ticketEstimado: [0, [Validators.required, Validators.min(0)]],
      prioridad: ['media'],
      localidad: [''],
      notas: [''],
      activo: [true],
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.id.set(id);
      this.isEdit.set(true);
      this.leadService.getById(id).subscribe((r) => {
        this.loading.set(false);
        if (r.ok && r.data) this.form.patchValue(r.data);
        else this.message.set(r.message || 'Error');
      });
    } else {
      this.loading.set(false);
    }
  }

  submit() {
    this.message.set(null);
    const id = this.id();
    const payload = this.form.value;
    if (id) {
      this.leadService.update(id, payload, true).subscribe((r) => this.handleResponse(r, 'Actualizado'));
    } else {
      this.leadService.create(payload).subscribe((r) => this.handleResponse(r, 'Creado'));
    }
  }

  private handleResponse(r: { ok?: boolean; message?: string; errors?: { field: string; message: string }[] }, successMsg: string) {
    if (r.ok) {
      this.router.navigate(['/leads']);
    } else {
      const msg = r.errors?.map((e) => e.message).join(', ') || r.message || 'Error';
      this.message.set(msg);
    }
  }
}
