import axios, { AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: { field: string; message: string }[];
}

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function get<T>(path: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
  try {
    const { data } = await api.get<ApiResponse<T>>(path, { params });
    return data;
  } catch (err: unknown) {
    const ax = err as { response?: { data?: ApiResponse<T> }; message?: string };
    return ax.response?.data ?? { ok: false, message: ax.message ?? 'Error' };
  }
}

export async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const { data } = await api.post<ApiResponse<T>>(path, body);
    return data;
  } catch (err: unknown) {
    const ax = err as { response?: { data?: ApiResponse<T> }; message?: string };
    return ax.response?.data ?? { ok: false, message: ax.message ?? 'Error' };
  }
}

export async function put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const { data } = await api.put<ApiResponse<T>>(path, body);
    return data;
  } catch (err: unknown) {
    const ax = err as { response?: { data?: ApiResponse<T> }; message?: string };
    return ax.response?.data ?? { ok: false, message: ax.message ?? 'Error' };
  }
}

export async function patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const { data } = await api.patch<ApiResponse<T>>(path, body);
    return data;
  } catch (err: unknown) {
    const ax = err as { response?: { data?: ApiResponse<T> }; message?: string };
    return ax.response?.data ?? { ok: false, message: ax.message ?? 'Error' };
  }
}

export async function del<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const { data } = await api.delete<ApiResponse<T>>(path);
    return data;
  } catch (err: unknown) {
    const ax = err as { response?: { data?: ApiResponse<T> }; message?: string };
    return ax.response?.data ?? { ok: false, message: ax.message ?? 'Error' };
  }
}
