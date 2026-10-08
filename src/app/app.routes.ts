import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
  {
    path: 'movies/:slug',
    loadComponent: () =>
      import('./features/movie-details/movie-details').then((m) => m.MovieDetails),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
    title: 'My Profile',
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/profile/personal-info/personal-info').then((m) => m.PersonalInfo),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/profile/my-tickets/my-tickets').then((m) => m.MyTickets),
      },
    ],
  },
];
