import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./patients-list.page').then(m => m.PatientsListPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/registration/patient-registration.page').then(m => m.PatientRegistrationPage)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detail/patient-detail.page').then(m => m.PatientDetailPage)
  },
  {
    path: ':id/family',
    loadComponent: () => import('./pages/family/family-members.page').then(m => m.FamilyMembersPage)
  }
];
