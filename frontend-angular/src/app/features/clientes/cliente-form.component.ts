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
  templateUrl: './cliente-form.component.html',
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
