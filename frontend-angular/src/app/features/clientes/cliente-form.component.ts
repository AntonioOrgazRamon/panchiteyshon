import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService, Cliente } from '../../services/cliente.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

const ESTADOS = ['activo', 'pausado', 'finalizado'];

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoaderComponent, AlertComponent],
  template: `
    <h1>{{ isEdit() ? 'Editar cliente' : 'Nuevo cliente' }}</h1>
    <app-alert [message]="message()" type="error" />
    @if (loading()) {
      <app-loader />
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()" class="card card-body">
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label">Nombre contacto *</label>
            <input type="text" class="form-control" formControlName="nombreContacto" />
            @if (form.get('nombreContacto')?.invalid && form.get('nombreContacto')?.touched) {
              <small class="text-danger">Requerido</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Empresa *</label>
            <input type="text" class="form-control" formControlName="empresa" />
            @if (form.get('empresa')?.invalid && form.get('empresa')?.touched) {
              <small class="text-danger">Requerida</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Teléfono *</label>
            <input type="text" class="form-control" formControlName="telefono" />
            @if (form.get('telefono')?.invalid && form.get('telefono')?.touched) {
              <small class="text-danger">Requerido</small>
            }
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Ciudad</label>
            <input type="text" class="form-control" formControlName="ciudad" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Web</label>
            <input type="text" class="form-control" formControlName="web" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Estado</label>
            <select class="form-select" formControlName="estadoCliente">
              @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">MRR (≥ 0)</label>
            <input type="number" class="form-control" formControlName="mrr" min="0" />
            @if (form.get('mrr')?.invalid && form.get('mrr')?.touched) {
              <small class="text-danger">Debe ser &gt;= 0</small>
            }
          </div>
          <div class="col-md-4">
            <label class="form-label">Próxima revisión</label>
            <input type="datetime-local" class="form-control" formControlName="proximaRevision" />
          </div>
          <div class="col-12">
            <label class="form-label">Servicios contratados (separados por coma)</label>
            <input type="text" class="form-control" formControlName="serviciosContratadosStr" placeholder="Web, Marketing, Soporte" />
          </div>
          <div class="col-12">
            <label class="form-label">Observaciones internas</label>
            <textarea class="form-control" formControlName="observacionesInternas" rows="3"></textarea>
          </div>
        </div>
        <div class="mt-3">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
          <a routerLink="/clientes" class="btn btn-secondary ms-2">Cancelar</a>
        </div>
      </form>
    }
  `,
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clienteService = inject(ClienteService);

  form!: FormGroup;
  loading = signal(true);
  message = signal<string | null>(null);
  isEdit = signal(false);
  id = signal<string | null>(null);
  estados = ESTADOS;

  ngOnInit() {
    this.form = this.fb.group({
      nombreContacto: ['', Validators.required],
      empresa: ['', Validators.required],
      telefono: ['', Validators.required],
      email: [''],
      ciudad: [''],
      web: [''],
      estadoCliente: ['activo'],
      serviciosContratadosStr: [''],
      mrr: [null as number | null, [Validators.min(0)]],
      proximaRevision: [''],
      observacionesInternas: [''],
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.id.set(id);
      this.isEdit.set(true);
      this.clienteService.getById(id).subscribe((r) => {
        this.loading.set(false);
        if (r.ok && r.data) {
          const d = r.data;
          this.form.patchValue({
            nombreContacto: d.nombreContacto,
            empresa: d.empresa,
            telefono: d.telefono,
            email: d.email ?? '',
            ciudad: d.ciudad ?? '',
            web: d.web ?? '',
            estadoCliente: d.estadoCliente,
            serviciosContratadosStr: Array.isArray(d.serviciosContratados) ? d.serviciosContratados.join(', ') : '',
            mrr: d.mrr ?? null,
            proximaRevision: d.proximaRevision ? d.proximaRevision.slice(0, 16) : '',
            observacionesInternas: d.observacionesInternas ?? '',
          });
        } else {
          this.message.set(r.message || 'Error');
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  submit() {
    this.message.set(null);
    const id = this.id();
    const raw = this.form.value;
    const serviciosStr = (raw.serviciosContratadosStr || '').trim();
    const payload: Partial<Cliente> = {
      nombreContacto: raw.nombreContacto,
      empresa: raw.empresa,
      telefono: raw.telefono,
      email: raw.email || '',
      ciudad: raw.ciudad || '',
      web: raw.web || '',
      estadoCliente: raw.estadoCliente,
      serviciosContratados: serviciosStr ? serviciosStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      mrr: raw.mrr !== '' && raw.mrr != null ? Number(raw.mrr) : null,
      proximaRevision: raw.proximaRevision ? new Date(raw.proximaRevision).toISOString() : null,
      observacionesInternas: raw.observacionesInternas || '',
    };
    if (id) {
      this.clienteService.update(id, payload, true).subscribe((r) => this.handleResponse(r));
    } else {
      this.clienteService.create(payload).subscribe((r) => this.handleResponse(r));
    }
  }

  private handleResponse(r: { ok?: boolean; message?: string; errors?: { field: string; message: string }[] }) {
    if (r.ok) {
      this.router.navigate(['/clientes']);
    } else {
      const msg = r.errors?.map((e) => e.message).join(', ') || r.message || 'Error';
      this.message.set(msg);
    }
  }
}
