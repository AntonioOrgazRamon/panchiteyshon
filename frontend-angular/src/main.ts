import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { API_BASE } from './app/core/api-base.token';
import { environment } from './environments/environment';

interface AppConfig {
  apiBase?: string;
}

declare global {
  interface Window {
    __API_BASE__?: string;
  }
}

async function loadConfig(): Promise<string> {
  // 1) Override in index.html: <script>window.__API_BASE__ = 'https://...';</script>
  if (typeof window !== 'undefined' && window.__API_BASE__?.trim()) {
    return window.__API_BASE__.trim();
  }
  // 2) Si el build ya trae URL absoluta (ej. npm run build con API en otro dominio), usarla y no cargar config.json
  const envBase = environment.apiBase?.trim() ?? '';
  if (envBase.startsWith('http://') || envBase.startsWith('https://')) {
    return envBase;
  }
  // 3) config.json solo cuando apiBase es relativo (/api/v1)
  try {
    const res = await fetch('config.json');
    if (res.ok) {
      const text = await res.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('{')) {
        const config: AppConfig = JSON.parse(trimmed);
        if (config.apiBase?.trim()) return config.apiBase.trim();
      }
    }
  } catch {
    // ignore
  }
  return environment.apiBase;
}

loadConfig().then((apiBase) => {
  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(withFetch()),
      { provide: API_BASE, useValue: apiBase },
    ],
  }).catch((err) => console.error(err));
});
