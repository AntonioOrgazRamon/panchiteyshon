import * as api from './api';

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
  fechaVencimiento?: string | null;
  fechaRecordatorio?: string | null;
  completada: boolean;
}

export async function getTareas() {
  return api.get<Tarea[]>('/tareas/get/all');
}

export async function getTareasPaginated(params: {
  page?: number;
  limit?: number;
  estado?: string;
  prioridad?: string;
  leadId?: string;
  clienteId?: string;
  categoriaPlanificacion?: string;
}) {
  const p: Record<string, string | number> = {};
  if (params.page != null) p.page = params.page;
  if (params.limit != null) p.limit = params.limit;
  if (params.estado) p.estado = params.estado;
  if (params.prioridad) p.prioridad = params.prioridad;
  if (params.leadId) p.leadId = params.leadId;
  if (params.clienteId) p.clienteId = params.clienteId;
  if (params.categoriaPlanificacion) p.categoriaPlanificacion = params.categoriaPlanificacion;
  return api.get<Tarea[]>('/tareas/get/all/paginated', p);
}

export async function getTareasUpcoming(days = 7) {
  return api.get<Tarea[]>('/tareas/get/upcoming', { days });
}

export async function getTareasToday() {
  return api.get<Tarea[]>('/tareas/get/today');
}

export async function getTareaById(id: string) {
  return api.get<Tarea>(`/tareas/get/${id}`);
}

export async function createTarea(body: Partial<Tarea>) {
  return api.post<Tarea>('/tareas/post', body);
}

export async function updateTarea(id: string, body: Partial<Tarea>, patch = false) {
  const path = `/tareas/update/${id}`;
  return patch ? api.patch<Tarea>(path, body) : api.put<Tarea>(path, body);
}

export async function deleteTarea(id: string) {
  return api.del<{ id: string }>(`/tareas/delete/${id}`);
}
