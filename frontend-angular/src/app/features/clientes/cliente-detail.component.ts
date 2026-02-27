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
  templateUrl: './cliente-detail.component.html',
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
