import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'patients',
    loadChildren: () => import('./features/patients/patients.routes').then(m => m.routes)
  },
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.routes)
  },
  {
    path: 'doctors',
    loadChildren: () => import('./features/doctors/doctors.routes').then(m => m.routes)
  },
];
