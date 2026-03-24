import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

const LAB_ROLES = ['ADMIN', 'LAB_TECH', 'RECEPTIONIST', 'DOCTOR'];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/lab-dashboard/lab-dashboard.page').then(m => m.LabDashboardPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/order-list/order-list.page').then(m => m.OrderListPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  },
  {
    path: 'orders/new',
    loadComponent: () => import('./pages/create-order/create-order.page').then(m => m.CreateOrderPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  },
  {
    path: 'results/new',
    loadComponent: () => import('./pages/result-entry/result-entry.page').then(m => m.ResultEntryPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  },
  {
    path: 'catalogue',
    loadComponent: () => import('./pages/catalogue-list/catalogue-list.page').then(m => m.CatalogueListPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  },
  {
    path: 'catalogue/new',
    loadComponent: () => import('./pages/catalogue-form/catalogue-form.page').then(m => m.CatalogueFormPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  },
  {
    path: 'catalogue/:id/edit',
    loadComponent: () => import('./pages/catalogue-form/catalogue-form.page').then(m => m.CatalogueFormPage),
    canActivate: [roleGuard],
    data: { roles: LAB_ROLES }
  }
];
