import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-summary.component').then(m => m.DashboardSummaryComponent) },
  { path: 'leads', loadComponent: () => import('./features/leads/lead-list.component').then(m => m.LeadListComponent) },
  { path: 'leads/new', loadComponent: () => import('./features/leads/lead-form.component').then(m => m.LeadFormComponent) },
  { path: 'leads/:id', loadComponent: () => import('./features/leads/lead-detail.component').then(m => m.LeadDetailComponent) },
  { path: 'leads/:id/edit', loadComponent: () => import('./features/leads/lead-form.component').then(m => m.LeadFormComponent) },
  { path: 'interacciones', loadComponent: () => import('./features/interacciones/interaccion-list.component').then(m => m.InteraccionListComponent) },
  { path: 'interacciones/new', loadComponent: () => import('./features/interacciones/interaccion-form.component').then(m => m.InteraccionFormComponent) },
  { path: 'interacciones/:id/edit', loadComponent: () => import('./features/interacciones/interaccion-form.component').then(m => m.InteraccionFormComponent) },
  { path: 'tareas', loadComponent: () => import('./features/tareas/tarea-list.component').then(m => m.TareaListComponent) },
  { path: 'tareas/new', loadComponent: () => import('./features/tareas/tarea-form.component').then(m => m.TareaFormComponent) },
  { path: 'tareas/:id/edit', loadComponent: () => import('./features/tareas/tarea-form.component').then(m => m.TareaFormComponent) },
  { path: 'clientes', loadComponent: () => import('./features/clientes/cliente-list.component').then(m => m.ClienteListComponent) },
  { path: 'clientes/new', loadComponent: () => import('./features/clientes/cliente-form.component').then(m => m.ClienteFormComponent) },
  { path: 'clientes/:id', loadComponent: () => import('./features/clientes/cliente-detail.component').then(m => m.ClienteDetailComponent) },
  { path: 'clientes/:id/edit', loadComponent: () => import('./features/clientes/cliente-form.component').then(m => m.ClienteFormComponent) },
  { path: '**', redirectTo: '/dashboard' },
];
