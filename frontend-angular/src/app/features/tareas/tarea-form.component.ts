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
  templateUrl: './tarea-form.component.html',
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
