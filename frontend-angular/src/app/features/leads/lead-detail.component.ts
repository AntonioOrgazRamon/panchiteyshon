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
  templateUrl: './lead-detail.component.html',
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
