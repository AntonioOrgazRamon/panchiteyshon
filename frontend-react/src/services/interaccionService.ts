import * as api from './api';

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
}

export async function getInteracciones() {
  return api.get<Interaccion[]>('/interacciones/get/all');
}

export async function getInteraccionesPaginated(params: {
  page?: number;
  limit?: number;
  leadId?: string;
  tipo?: string;
  resultado?: string;
}) {
  const p: Record<string, string> = {};
  if (params.page != null) p.page = String(params.page);
  if (params.limit != null) p.limit = String(params.limit);
  if (params.leadId) p.leadId = params.leadId;
  if (params.tipo) p.tipo = params.tipo;
  if (params.resultado) p.resultado = params.resultado;
  return api.get<Interaccion[]>('/interacciones/get/all/paginated', p);
}

export async function getInteraccionById(id: string) {
  return api.get<Interaccion>(`/interacciones/get/${id}`);
}

export async function createInteraccion(body: Partial<Interaccion>) {
  return api.post<Interaccion>('/interacciones/post', body);
}

export async function updateInteraccion(id: string, body: Partial<Interaccion>, patch = false) {
  const path = `/interacciones/update/${id}`;
  return patch ? api.patch<Interaccion>(path, body) : api.put<Interaccion>(path, body);
}

export async function deleteInteraccion(id: string) {
  return api.del<{ id: string }>(`/interacciones/delete/${id}`);
}
