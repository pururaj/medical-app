import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./doctors-list.page').then(m => m.DoctorsListPage)
  },
  {
    path: ':id',
    loadComponent: () => import('./doctor-detail.page').then(m => m.DoctorDetailPage)
  }
];
