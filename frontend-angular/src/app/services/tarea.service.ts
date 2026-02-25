import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../core/api.service';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  estado: string;
  prioridad: string;
  leadId?: string | null;
  clienteId?: string | null;
  categoriaPlanificacion?: string;
  repeticion?: string;
  fechaProgramada?: string | null;
  ordenManual?: number | null;
  esHabitual?: boolean;
  fechaVencimiento?: string | null;
  fechaRecordatorio?: string | null;
  completada: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TareaService {
  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<Tarea[]>> {
    return this.api.get<Tarea[]>('/tareas/get/all');
  }

  getPaginated(params: { page?: number; limit?: number; estado?: string; prioridad?: string; leadId?: string; clienteId?: string; categoriaPlanificacion?: string }): Observable<ApiResponse<Tarea[]>> {
    const p: Record<string, string | number> = {};
    if (params.page != null) p['page'] = params.page;
    if (params.limit != null) p['limit'] = params.limit;
    if (params.estado) p['estado'] = params.estado;
    if (params.prioridad) p['prioridad'] = params.prioridad;
    if (params.leadId) p['leadId'] = params.leadId;
    if (params.clienteId) p['clienteId'] = params.clienteId;
    if (params.categoriaPlanificacion) p['categoriaPlanificacion'] = params.categoriaPlanificacion;
    return this.api.get<Tarea[]>('/tareas/get/all/paginated', p);
  }

  getUpcoming(days = 7): Observable<ApiResponse<Tarea[]>> {
    return this.api.get<Tarea[]>('/tareas/get/upcoming', { days });
  }

  getToday(): Observable<ApiResponse<Tarea[]>> {
    return this.api.get<Tarea[]>('/tareas/get/today');
  }

  getById(id: string): Observable<ApiResponse<Tarea>> {
    return this.api.get<Tarea>(`/tareas/get/${id}`);
  }

  create(tarea: Partial<Tarea>): Observable<ApiResponse<Tarea>> {
    return this.api.post<Tarea>('/tareas/post', tarea);
  }

  update(id: string, tarea: Partial<Tarea>, patch = false): Observable<ApiResponse<Tarea>> {
    const path = `/tareas/update/${id}`;
    return patch ? this.api.patch<Tarea>(path, tarea) : this.api.put<Tarea>(path, tarea);
  }

  delete(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.api.delete<{ id: string }>(`/tareas/delete/${id}`);
  }
}
