import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: 'patients',
    loadChildren: () => import('./features/patients/patients.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'doctors',
    loadChildren: () => import('./features/doctors/doctors.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'staff',
    loadChildren: () => import('./features/staff/staff.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'inventory',
    loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'pharmacy',
    loadChildren: () => import('./features/pharmacy/pharmacy.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
];
