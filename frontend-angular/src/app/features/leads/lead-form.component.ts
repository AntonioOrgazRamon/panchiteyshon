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
  templateUrl: './lead-form.component.html',
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
