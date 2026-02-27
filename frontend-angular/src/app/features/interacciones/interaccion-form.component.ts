import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InteraccionService } from '../../services/interaccion.service';
import { LeadService, Lead } from '../../services/lead.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

@Component({
  selector: 'app-interaccion-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoaderComponent, AlertComponent],
  templateUrl: './interaccion-form.component.html',
})
export class InteraccionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(InteraccionService);
  private leadService = inject(LeadService);

  form!: FormGroup;
  loading = signal(true);
  message = signal<string | null>(null);
  isEdit = signal(false);
  id = signal<string | null>(null);
  leads = signal<Lead[]>([]);

  ngOnInit() {
    this.form = this.fb.group({
      leadId: ['', Validators.required],
      tipo: ['nota'],
      direccion: ['saliente'],
      resumen: ['', Validators.required],
      resultado: ['pendiente'],
      fechaInteraccion: [new Date().toISOString().slice(0, 16), Validators.required],
      proximaAccionFecha: [''],
      duracionMin: [null as number | null],
    });
    this.leadService.getAll().subscribe((r) => {
      if (r.ok && r.data) this.leads.set(r.data);
    });
    const id = this.route.snapshot.paramMap.get('id');
    const leadId = this.route.snapshot.queryParamMap.get('leadId');
    if (leadId) this.form.patchValue({ leadId });
    if (id && id !== 'new') {
      this.id.set(id);
      this.isEdit.set(true);
      this.service.getById(id).subscribe((r) => {
        this.loading.set(false);
        if (r.ok && r.data) {
          const d = r.data;
          this.form.patchValue({
            leadId: d.leadId,
            tipo: d.tipo,
            direccion: d.direccion,
            resumen: d.resumen,
            resultado: d.resultado,
            fechaInteraccion: d.fechaInteraccion ? new Date(d.fechaInteraccion).toISOString().slice(0, 16) : '',
            proximaAccionFecha: d.proximaAccionFecha ? new Date(d.proximaAccionFecha).toISOString().slice(0, 16) : '',
            duracionMin: d.duracionMin ?? null,
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
      leadId: raw.leadId,
      tipo: raw.tipo,
      direccion: raw.direccion,
      resumen: raw.resumen,
      resultado: raw.resultado,
      fechaInteraccion: raw.fechaInteraccion ? new Date(raw.fechaInteraccion).toISOString() : new Date().toISOString(),
      proximaAccionFecha: raw.proximaAccionFecha ? new Date(raw.proximaAccionFecha).toISOString() : null,
      duracionMin: raw.duracionMin != null && raw.duracionMin !== '' ? +raw.duracionMin : null,
    };
    const id = this.id();
    if (id) {
      this.service.update(id, payload, true).subscribe((r) => {
        if (r.ok) this.router.navigate(['/interacciones']);
        else this.message.set(r.message || 'Error');
      });
    } else {
      this.service.create(payload).subscribe((r) => {
        if (r.ok) this.router.navigate(['/interacciones']);
        else this.message.set(r.message || 'Error');
      });
    }
  }
}
