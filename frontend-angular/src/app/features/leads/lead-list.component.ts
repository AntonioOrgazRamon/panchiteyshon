import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { API_BASE } from '../../core/api-base.token';
import { LeadService, Lead } from '../../services/lead.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoaderComponent, AlertComponent],
  templateUrl: './lead-list.component.html',
  styleUrls: ['./lead-list.component.css'],
})
export class LeadListComponent implements OnInit {
  loading = signal(true);
  leads = signal<Lead[]>([]);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error' | 'info'>('info');
  page = signal(1);
  limit = 50; // Higher limit for Kanban to make sense
  total = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));

  viewMode = signal<'table' | 'kanban'>('table');
  kanbanDragging = signal(false);
  private kanbanDrag: { el: HTMLElement; startX: number; startScrollLeft: number } | null = null;

  search = '';
  estadoPipeline = '';
  prioridad = '';
  canalOrigen = '';
  fechaCreacionDesde = '';
  fechaCreacionHasta = '';
  ticketMin: number | '' = '';
  ticketMax: number | '' = '';
  leadToDelete = signal<Lead | null>(null);

  kanbanColumns = [
    { id: 'nuevo', label: 'Nuevo' },
    { id: 'contactado', label: 'Contactado' },
    { id: 'interesado', label: 'Interesado' },
    { id: 'reunion', label: 'Reunión' },
    { id: 'propuesta', label: 'Propuesta' },
    { id: 'cerrado', label: 'Cerrado' },
    { id: 'perdido', label: 'Perdido' }
  ];

  private readonly leadService = inject(LeadService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiBase = inject(API_BASE);

  openLead(id: string) {
    this.router.navigate(['/leads', id]);
  }

  kanbanDragStart(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest('.kanban-board') as HTMLElement;
    if (!el) return;
    this.kanbanDrag = { el, startX: e.clientX, startScrollLeft: el.scrollLeft };
    this.kanbanDragging.set(false);
    const onMove = (ev: MouseEvent) => {
      if (!this.kanbanDrag) return;
      this.kanbanDragging.set(true);
      const dx = ev.clientX - this.kanbanDrag.startX;
      this.kanbanDrag.el.scrollLeft = this.kanbanDrag.startScrollLeft - dx;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.kanbanDrag = null;
      setTimeout(() => this.kanbanDragging.set(false), 0);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  kanbanTouchStart(e: TouchEvent) {
    const el = (e.target as HTMLElement).closest('.kanban-board') as HTMLElement;
    if (!el || !e.touches[0]) return;
    const startX = e.touches[0].clientX;
    const startScrollLeft = el.scrollLeft;
    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches[0]) {
        const dx = ev.touches[0].clientX - startX;
        el.scrollLeft = startScrollLeft - dx;
      }
    };
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
  }

  exportCsvUrl() {
    return `${this.apiBase}/leads/get/export/csv`;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((qp) => {
      if (qp['estadoPipeline']) this.estadoPipeline = qp['estadoPipeline'];
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.leadService.getPaginated({
      page: this.page(),
      limit: this.limit,
      search: this.search,
      estadoPipeline: this.estadoPipeline,
      prioridad: this.prioridad,
      canalOrigen: this.canalOrigen,
      fechaCreacionDesde: this.fechaCreacionDesde || undefined,
      fechaCreacionHasta: this.fechaCreacionHasta || undefined,
      ticketMin: this.ticketMin !== '' ? this.ticketMin : undefined,
      ticketMax: this.ticketMax !== '' ? this.ticketMax : undefined,
    }).subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.leads.set(r.data);
        if (r.meta && typeof r.meta['total'] === 'number') this.total.set(r.meta['total']);
      } else {
        this.message.set(r.message || 'Error al cargar');
        this.messageType.set('error');
      }
    });
  }

  getLeadsByStatus(status: string) {
    return this.leads().filter(l => l.estadoPipeline === status);
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  confirmDelete(lead: Lead) {
    this.leadToDelete.set(lead);
  }

  doDelete() {
    const lead = this.leadToDelete();
    if (!lead) return;
    this.leadService.delete(lead.id).subscribe((r) => {
      this.leadToDelete.set(null);
      if (r.ok) {
        this.message.set('Lead eliminado');
        this.messageType.set('success');
        this.load();
      } else {
        this.message.set(r.message || 'Error');
        this.messageType.set('error');
      }
    });
  }
}
