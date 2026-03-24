import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

const PHARMACY_ROLES = ['ADMIN', 'PHARMACIST', 'RECEPTIONIST'];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pos-sales/pos-sales.page').then(m => m.POSSalesPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/sales-history/sales-history.page').then(m => m.SalesHistoryPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'history/:id',
    loadComponent: () => import('./pages/sale-detail/sale-detail.page').then(m => m.SaleDetailPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'customers',
    loadComponent: () => import('./pages/customer-list/customer-list.page').then(m => m.CustomerListPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'customers/new',
    loadComponent: () => import('./pages/customer-form/customer-form.page').then(m => m.CustomerFormPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'customers/:id/edit',
    loadComponent: () => import('./pages/customer-form/customer-form.page').then(m => m.CustomerFormPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'returns',
    loadComponent: () => import('./pages/returns-list/returns-list.page').then(m => m.ReturnsListPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'returns/new',
    loadComponent: () => import('./pages/create-return/create-return.page').then(m => m.CreateReturnPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'return-exchange',
    loadComponent: () => import('./pages/return-exchange/return-exchange.page').then(m => m.ReturnExchangePage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  },
  {
    path: 'day-end-report',
    loadComponent: () => import('./pages/day-end-report/day-end-report.page').then(m => m.DayEndReportPage),
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ROLES }
  }
];
