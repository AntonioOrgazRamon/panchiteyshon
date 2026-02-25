import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from '../core/api.service';

export interface Interaccion {
  id: string;
  leadId: string;
  tipo: string;
  direccion: string;
  resumen: string;
  resultado: string;
  fechaInteraccion: string;
  proximaAccionFecha?: string | null;
  duracionMin?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class InteraccionService {
  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<Interaccion[]>> {
    return this.api.get<Interaccion[]>('/interacciones/get/all');
  }

  getPaginated(params: { page?: number; limit?: number; leadId?: string; tipo?: string; resultado?: string }): Observable<ApiResponse<Interaccion[]>> {
    const p: Record<string, string | number> = {};
    if (params.page != null) p['page'] = params.page;
    if (params.limit != null) p['limit'] = params.limit;
    if (params.leadId) p['leadId'] = params.leadId;
    if (params.tipo) p['tipo'] = params.tipo;
    if (params.resultado) p['resultado'] = params.resultado;
    return this.api.get<Interaccion[]>('/interacciones/get/all/paginated', p);
  }

  getById(id: string): Observable<ApiResponse<Interaccion>> {
    return this.api.get<Interaccion>(`/interacciones/get/${id}`);
  }

  create(body: Partial<Interaccion>): Observable<ApiResponse<Interaccion>> {
    return this.api.post<Interaccion>('/interacciones/post', body);
  }

  update(id: string, body: Partial<Interaccion>, patch = false): Observable<ApiResponse<Interaccion>> {
    const path = `/interacciones/update/${id}`;
    return patch ? this.api.patch<Interaccion>(path, body) : this.api.put<Interaccion>(path, body);
  }

  delete(id: string): Observable<ApiResponse<{ id: string }>> {
    return this.api.delete<{ id: string }>(`/interacciones/delete/${id}`);
  }
}
