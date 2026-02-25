import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../core/api.service';

export interface Cliente {
  id: string;
  nombreContacto: string;
  empresa: string;
  telefono: string;
  email?: string;
  ciudad?: string;
  web?: string;
  estadoCliente: string;
  serviciosContratados: string[];
  mrr?: number | null;
  fechaAlta: string;
  ultimaInteraccion?: string | null;
  proximaRevision?: string | null;
  observacionesInternas?: string;
  leadOrigenId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientePaginatedParams {
  page?: number;
  limit?: number;
  search?: string;
  estadoCliente?: string;
  servicio?: string;
  fechaAltaDesde?: string;
  fechaAltaHasta?: string;
  proximaRevisionDesde?: string;
  proximaRevisionHasta?: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<Cliente[]>> {
    return this.api.get<Cliente[]>('/clientes/get/all');
  }

  getPaginated(params: ClientePaginatedParams): Observable<ApiResponse<Cliente[]>> {
    const p: Record<string, string | number> = {};
    if (params.page != null) p['page'] = params.page;
    if (params.limit != null) p['limit'] = params.limit;
    if (params.search) p['search'] = params.search;
    if (params.estadoCliente) p['estadoCliente'] = params.estadoCliente;
    if (params.servicio) p['servicio'] = params.servicio;
    if (params.fechaAltaDesde) p['fechaAltaDesde'] = params.fechaAltaDesde;
    if (params.fechaAltaHasta) p['fechaAltaHasta'] = params.fechaAltaHasta;
    if (params.proximaRevisionDesde) p['proximaRevisionDesde'] = params.proximaRevisionDesde;
    if (params.proximaRevisionHasta) p['proximaRevisionHasta'] = params.proximaRevisionHasta;
    return this.api.get<Cliente[]>('/clientes/get/all/paginated', p);
  }

  getById(id: string): Observable<ApiResponse<Cliente>> {
    return this.api.get<Cliente>(`/clientes/get/${id}`);
  }

  getTareas(id: string): Observable<ApiResponse<unknown[]>> {
    return this.api.get<unknown[]>(`/clientes/get/${id}/tareas`);
  }

  create(cliente: Partial<Cliente>): Observable<ApiResponse<Cliente>> {
    return this.api.post<Cliente>('/clientes/post', cliente);
  }

  update(id: string, cliente: Partial<Cliente>, patch = false): Observable<ApiResponse<Cliente>> {
    const path = `/clientes/update/${id}`;
    return patch ? this.api.patch<Cliente>(path, cliente) : this.api.put<Cliente>(path, cliente);
  }

  delete(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.api.delete<{ id: string }>(`/clientes/delete/${id}`);
  }
}
