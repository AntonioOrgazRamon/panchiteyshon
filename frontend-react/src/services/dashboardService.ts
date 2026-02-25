import * as api from './api';

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
  proximasTareas?: TareaSummary[];
  tareasHoy?: TareaSummary[];
  actividadReciente?: { tipo: string; fecha: string; titulo: string; entidadId?: string }[];
}

interface TareaSummary {
  id: string;
  titulo: string;
  estado: string;
  prioridad: string;
  fechaVencimiento?: string | null;
  fechaRecordatorio?: string | null;
}

export async function getDashboardSummary() {
  return api.get<DashboardSummary>('/dashboard/summary');
}
