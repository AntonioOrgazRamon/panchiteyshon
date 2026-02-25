import * as api from './api';

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
}

export async function getClientes() {
  return api.get<Cliente[]>('/clientes/get/all');
}

export async function getClientesPaginated(params: {
  page?: number;
  limit?: number;
  search?: string;
  estadoCliente?: string;
  servicio?: string;
}) {
  const p: Record<string, string | number> = {};
  if (params.page != null) p.page = params.page;
  if (params.limit != null) p.limit = params.limit;
  if (params.search) p.search = params.search;
  if (params.estadoCliente) p.estadoCliente = params.estadoCliente;
  if (params.servicio) p.servicio = params.servicio;
  return api.get<Cliente[]>('/clientes/get/all/paginated', p);
}

export async function getClienteById(id: string) {
  return api.get<Cliente>(`/clientes/get/${id}`);
}

export async function getClienteTareas(id: string) {
  return api.get<unknown[]>(`/clientes/get/${id}/tareas`);
}

export async function createCliente(body: Partial<Cliente>) {
  return api.post<Cliente>('/clientes/post', body);
}

export async function updateCliente(id: string, body: Partial<Cliente>, patch = false) {
  const path = `/clientes/update/${id}`;
  return patch ? api.patch<Cliente>(path, body) : api.put<Cliente>(path, body);
}

export async function deleteCliente(id: string) {
  return api.del<{ id: string }>(`/clientes/delete/${id}`);
}
