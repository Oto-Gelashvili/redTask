import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'sessions',
    loadComponent: () => import('./features/sessions/sessions').then((m) => m.Sessions),
    title: 'Browse Sessions',
  },
];
