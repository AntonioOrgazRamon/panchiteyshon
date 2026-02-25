import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-wrap">
      <aside class="sidebar-crm">
        <a class="sidebar-brand" routerLink="/dashboard">NakedCRM Lite</a>
        <nav class="sidebar-nav">
          <a class="sidebar-link" routerLink="/dashboard" routerLinkActive="active"><i class="bi bi-grid-1x2"></i> Dashboard</a>
          <a class="sidebar-link" routerLink="/leads" routerLinkActive="active"><i class="bi bi-person-lines-fill"></i> Leads</a>
          <a class="sidebar-link" routerLink="/clientes" routerLinkActive="active"><i class="bi bi-building"></i> Clientes</a>
          <a class="sidebar-link" routerLink="/interacciones" routerLinkActive="active"><i class="bi bi-chat-dots"></i> Interacciones</a>
          <a class="sidebar-link" routerLink="/tareas" routerLinkActive="active"><i class="bi bi-check2-square"></i> Tareas</a>
        </nav>
      </aside>
      <main class="main-content-crm container">
        <router-outlet></router-outlet>
      </main>
      <nav class="mobile-bottom-nav" aria-label="Navegación principal">
        <a class="mobile-bottom-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <i class="bi bi-grid-1x2"></i>
          <span>Inicio</span>
        </a>
        <a class="mobile-bottom-link" routerLink="/leads" [queryParams]="{ estadoPipeline: 'nuevo' }" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <i class="bi bi-person-plus"></i>
          <span>Leads sin contactar</span>
        </a>
        <a class="mobile-bottom-link" routerLink="/leads/new" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <i class="bi bi-plus-circle"></i>
          <span>Crear lead</span>
        </a>
        <a class="mobile-bottom-link" routerLink="/clientes" routerLinkActive="active">
          <i class="bi bi-building"></i>
          <span>Clientes</span>
        </a>
        <a class="mobile-bottom-link" routerLink="/tareas" routerLinkActive="active">
          <i class="bi bi-check2-square"></i>
          <span>Tareas</span>
        </a>
      </nav>
    </div>
  `,
})
export class AppComponent {}
