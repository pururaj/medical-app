import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

const ADMIN_ONLY = ['ADMIN'];

export const routes: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ONLY },
    loadComponent: () => import('./staff-list.page').then(m => m.StaffListPage)
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ONLY },
    loadComponent: () => import('./pages/form/staff-form.page').then(m => m.StaffFormPage)
  },
  {
    path: ':id',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ONLY },
    loadComponent: () => import('./pages/detail/staff-detail.page').then(m => m.StaffDetailPage)
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: ADMIN_ONLY },
    loadComponent: () => import('./pages/form/staff-form.page').then(m => m.StaffFormPage)
  }
];
