import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

const ADMIN_RECEP = ['ADMIN', 'RECEPTIONIST'];
const ALL_ROLES = ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH'];

export const routes: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ADMIN_RECEP },
    loadComponent: () => import('./patients-list.page').then(m => m.PatientsListPage)
  },
  {
    path: 'register',
    canActivate: [roleGuard],
    data: { roles: ADMIN_RECEP },
    loadComponent: () => import('./pages/registration/patient-registration.page').then(m => m.PatientRegistrationPage)
  },
  {
    path: ':id',
    canActivate: [roleGuard],
    data: { roles: ALL_ROLES },
    loadComponent: () => import('./pages/detail/patient-detail.page').then(m => m.PatientDetailPage)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: ADMIN_RECEP },
    loadComponent: () => import('./pages/edit/patient-edit.page').then(m => m.PatientEditPage)
  },
  {
    path: ':id/family',
    canActivate: [roleGuard],
    data: { roles: ADMIN_RECEP },
    loadComponent: () => import('./pages/family/family-members.page').then(m => m.FamilyMembersPage)
  }
];
