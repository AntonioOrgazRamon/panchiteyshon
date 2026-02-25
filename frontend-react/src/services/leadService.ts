import * as api from './api';

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

export async function getLeads() {
  return api.get<Lead[]>('/leads/get/all');
}

export async function getLeadsPaginated(params: {
  page?: number;
  limit?: number;
  search?: string;
  estadoPipeline?: string;
  prioridad?: string;
  canalOrigen?: string;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
  ticketMin?: number;
  ticketMax?: number;
}) {
  const p: Record<string, string | number> = {};
  if (params.page != null) p.page = params.page;
  if (params.limit != null) p.limit = params.limit;
  if (params.search) p.search = params.search;
  if (params.estadoPipeline) p.estadoPipeline = params.estadoPipeline;
  if (params.prioridad) p.prioridad = params.prioridad;
  if (params.canalOrigen) p.canalOrigen = params.canalOrigen;
  if (params.fechaCreacionDesde) p.fechaCreacionDesde = params.fechaCreacionDesde;
  if (params.fechaCreacionHasta) p.fechaCreacionHasta = params.fechaCreacionHasta;
  if (params.ticketMin != null) p.ticketMin = params.ticketMin;
  if (params.ticketMax != null) p.ticketMax = params.ticketMax;
  return api.get<Lead[]>('/leads/get/all/paginated', p);
}

export async function convertLeadToCliente(leadId: string, payload?: Record<string, unknown>) {
  return api.post<unknown>(`/leads/get/${leadId}/convertir-cliente`, payload ?? {});
}

export async function getLeadById(id: string) {
  return api.get<Lead>(`/leads/get/${id}`);
}

export async function getLeadInteracciones(id: string) {
  return api.get<unknown[]>(`/leads/get/${id}/interacciones`);
}

export async function getLeadTareas(id: string) {
  return api.get<unknown[]>(`/leads/get/${id}/tareas`);
}

export async function createLead(body: Partial<Lead>) {
  return api.post<Lead>('/leads/post', body);
}

export async function updateLead(id: string, body: Partial<Lead>, patch = false) {
  const path = `/leads/update/${id}`;
  return patch ? api.patch<Lead>(path, body) : api.put<Lead>(path, body);
}

export async function deleteLead(id: string) {
  return api.del<{ id: string }>(`/leads/delete/${id}`);
}

const apiBase = import.meta.env.VITE_API_URL || '/api/v1';
export const exportCsvUrl = () => `${apiBase}/leads/get/export/csv`;
