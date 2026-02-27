import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InteraccionService, Interaccion } from '../../services/interaccion.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-interaccion-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LoaderComponent, AlertComponent, DatePipe, SlicePipe],
  templateUrl: './interaccion-list.component.html',
})
export class InteraccionListComponent implements OnInit {
  loading = signal(true);
  items = signal<Interaccion[]>([]);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('error');
  page = signal(1);
  limit = 10;
  total = signal(0);
  totalPages = () => Math.max(1, Math.ceil(this.total() / this.limit));
  leadId = '';
  tipo = '';
  resultado = '';
  itemToDelete = signal<Interaccion | null>(null);

  constructor(private service: InteraccionService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getPaginated({
      page: this.page(),
      limit: this.limit,
      leadId: this.leadId,
      tipo: this.tipo,
      resultado: this.resultado,
    }).subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.items.set(r.data);
        if (r.meta && typeof r.meta['total'] === 'number') this.total.set(r.meta['total']);
      }
    });
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  confirmDelete(i: Interaccion) { this.itemToDelete.set(i); }

  doDelete() {
    const i = this.itemToDelete();
    if (!i) return;
    this.service.delete(i.id).subscribe((r) => {
      this.itemToDelete.set(null);
      if (r.ok) { this.message.set('Eliminada'); this.messageType.set('success'); this.load(); }
      else { this.message.set(r.message || 'Error'); this.messageType.set('error'); }
    });
  }
}
