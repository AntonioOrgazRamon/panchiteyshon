import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { TareaService } from '../../services/tarea.service';
import { LeadService, Lead } from '../../services/lead.service';
import { LoaderComponent } from '../../shared/loader.component';
import { AlertComponent } from '../../shared/alert.component';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, AlertComponent],
  templateUrl: './dashboard-summary.component.html',
  styleUrls: ['./dashboard-summary.component.css'],
})
export class DashboardSummaryComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  summary = signal<DashboardSummary | null>(null);
  leadsSinContactar = signal<Lead[]>([]);
  upcomingTasks = signal<{ id: string; titulo: string; fechaVencimiento?: string | null; prioridad: string }[]>([]);
  todayTasks = signal<{ id: string; titulo: string; estado: string; fechaVencimiento?: string | null; fechaRecordatorio?: string | null; prioridad: string }[]>([]);
  markingId = signal<string | null>(null);

  constructor(
    private dashboard: DashboardService,
    private tareaService: TareaService,
    private leadService: LeadService,
  ) {}

  closingTime(t: { fechaVencimiento?: string | null; fechaRecordatorio?: string | null }) {
    const d = t.fechaVencimiento || t.fechaRecordatorio;
    return d ? new Date(d) : null;
  }

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.dashboard.getSummary().subscribe((r) => {
      this.loading.set(false);
      if (r.ok && r.data) {
        this.summary.set(r.data);
        if (r.data.tareasHoy?.length) this.todayTasks.set(r.data.tareasHoy as any);
        if (r.data.proximasTareas?.length) this.upcomingTasks.set(r.data.proximasTareas.slice(0, 10) as any);
      } else {
        this.errorMessage.set(r.message || 'Error al cargar dashboard');
      }
    });
    this.leadService.getPaginated({ estadoPipeline: 'nuevo', limit: 12 }).subscribe((r) => {
      if (r.ok && r.data) this.leadsSinContactar.set(r.data);
    });
    this.tareaService.getUpcoming(7).subscribe((r) => {
      if (r.ok && r.data && !this.summary()?.proximasTareas?.length) this.upcomingTasks.set(r.data.slice(0, 10));
    });
    this.refreshTodayTasks();
  }

  refreshTodayTasks() {
    this.tareaService.getToday().subscribe((r) => {
      if (r.ok && r.data) this.todayTasks.set(r.data);
    });
  }

  markAsDone(t: { id: string }) {
    this.markingId.set(t.id);
    this.tareaService.update(t.id, { estado: 'hecha', completada: true }, true).subscribe((r) => {
      this.markingId.set(null);
      if (r.ok) this.refreshTodayTasks();
    });
  }
}
