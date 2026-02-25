import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_BASE } from './api-base.token';

export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: { field: string; message: string }[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE);

  get<T>(path: string, params?: Record<string, string | number>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<ApiResponse<T>>(this.apiBase + path, { params: httpParams }).pipe(
      catchError((err) => of({ ok: false, message: err?.error?.message || err.message } as ApiResponse<T>))
    );
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.apiBase + path, body).pipe(
      catchError((err) => of({ ok: false, message: err?.error?.message || err.message, errors: err?.error?.errors } as ApiResponse<T>))
    );
  }

  put<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(this.apiBase + path, body).pipe(
      catchError((err) => of({ ok: false, message: err?.error?.message || err.message, errors: err?.error?.errors } as ApiResponse<T>))
    );
  }

  patch<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(this.apiBase + path, body).pipe(
      catchError((err) => of({ ok: false, message: err?.error?.message || err.message, errors: err?.error?.errors } as ApiResponse<T>))
    );
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.apiBase + path).pipe(
      catchError((err) => of({ ok: false, message: err?.error?.message || err.message } as ApiResponse<T>))
    );
  }
}
