import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard',
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: 'sessions',
    loadComponent: () => import('./features/sessions/sessions').then((m) => m.Sessions),
    title: 'Browse Sessions',
  },
];
