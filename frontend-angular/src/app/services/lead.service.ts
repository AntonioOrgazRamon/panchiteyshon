import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../core/api.service';
import { API_BASE } from '../core/api-base.token';

export interface Lead {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email?: string;
  canalOrigen: string;
  estadoPipeline: string;
  ticketEstimado: number;
  prioridad: string;
  localidad?: string;
  notas?: string;
  activo: boolean;
  fechaAlta: string;
  ultimoContacto?: string | null;
  clienteId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadPaginatedParams {
  page?: number;
  limit?: number;
  search?: string;
  estadoPipeline?: string;
  prioridad?: string;
  canalOrigen?: string;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  ultimoContactoDesde?: string;
  ultimoContactoHasta?: string;
  ticketMin?: number;
  ticketMax?: number;
}

@Injectable({ providedIn: 'root' })
export class LeadService {
  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<Lead[]>> {
    return this.api.get<Lead[]>('/leads/get/all');
  }

  getPaginated(params: LeadPaginatedParams): Observable<ApiResponse<Lead[]>> {
    const p: Record<string, string | number> = {};
    if (params.page != null) p['page'] = params.page;
    if (params.limit != null) p['limit'] = params.limit;
    if (params.search) p['search'] = params.search;
    if (params.estadoPipeline) p['estadoPipeline'] = params.estadoPipeline;
    if (params.prioridad) p['prioridad'] = params.prioridad;
    if (params.canalOrigen) p['canalOrigen'] = params.canalOrigen;
    if (params.fechaCreacionDesde) p['fechaCreacionDesde'] = params.fechaCreacionDesde;
    if (params.fechaCreacionHasta) p['fechaCreacionHasta'] = params.fechaCreacionHasta;
    if (params.ultimoContactoDesde) p['ultimoContactoDesde'] = params.ultimoContactoDesde;
    if (params.ultimoContactoHasta) p['ultimoContactoHasta'] = params.ultimoContactoHasta;
    if (params.ticketMin != null) p['ticketMin'] = params.ticketMin;
    if (params.ticketMax != null) p['ticketMax'] = params.ticketMax;
    return this.api.get<Lead[]>('/leads/get/all/paginated', p);
  }

  convertToCliente(leadId: string, payload?: Record<string, unknown>): Observable<ApiResponse<unknown>> {
    return this.api.post<unknown>(`/leads/get/${leadId}/convertir-cliente`, payload ?? {});
  }

  getById(id: string): Observable<ApiResponse<Lead>> {
    return this.api.get<Lead>(`/leads/get/${id}`);
  }

  getInteracciones(id: string): Observable<ApiResponse<unknown[]>> {
    return this.api.get<unknown[]>(`/leads/get/${id}/interacciones`);
  }

  getTareas(id: string): Observable<ApiResponse<unknown[]>> {
    return this.api.get<unknown[]>(`/leads/get/${id}/tareas`);
  }

  create(lead: Partial<Lead>): Observable<ApiResponse<Lead>> {
    return this.api.post<Lead>('/leads/post', lead);
  }

  update(id: string, lead: Partial<Lead>, patch = false): Observable<ApiResponse<Lead>> {
    const path = `/leads/update/${id}`;
    return patch ? this.api.patch<Lead>(path, lead) : this.api.put<Lead>(path, lead);
  }

  delete(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.api.delete<{ id: string }>(`/leads/delete/${id}`);
  }

  private readonly apiBase = inject(API_BASE);

  exportCsv(): string {
    return `${this.apiBase}/leads/get/export/csv`;
  }
}
