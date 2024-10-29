import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from '../services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'talks',
        loadComponent: () =>
          import('./admin/talks/talks.component').then(m => m.TalksComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'attendees',
        loadComponent: () =>
          import('./admin/attendees/attendees.component').then(m => m.AttendeesComponent),
        canActivate: [AuthGuard],
      },
      { path: '', redirectTo: 'talks', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' }, // Fallback route
];
