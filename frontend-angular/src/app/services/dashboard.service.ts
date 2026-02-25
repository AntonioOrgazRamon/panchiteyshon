import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../core/api.service';

export interface DashboardSummary {
  totalLeads: number;
  leadsActivos: number;
  clientesActivos?: number;
  tareasPendientes: number;
  tareasPendientesHoy?: number;
  tareasVencidas: number;
  conversionLeadCliente?: number;
  reunionesSemana?: number;
  leadsPorEstado: Record<string, number>;
  leadsPorCanal: Record<string, number>;
  totalInteracciones: number;
  interaccionesUltimos30Dias: number;
  tareasPorPrioridad: { baja: number; media: number; alta: number };
  conversionRateBasica: number;
  sinRespuesta?: number;
  leadsRecientes?: unknown[];
  proximasTareas?: unknown[];
  tareasHoy?: unknown[];
  actividadReciente?: { tipo: string; fecha: string; titulo: string; entidadId?: string }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.api.get<DashboardSummary>('/dashboard/summary');
  }
}
