import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

const INVENTORY_ROLES = ['ADMIN', 'PHARMACIST'];

export const routes: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/medicine-list/medicine-list.page').then(m => m.MedicineListPage)
  },
  {
    path: 'medicines/new',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/medicine-form/medicine-form.page').then(m => m.MedicineFormPage)
  },
  {
    path: 'medicines/:id',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/medicine-detail/medicine-detail.page').then(m => m.MedicineDetailPage)
  },
  {
    path: 'medicines/:id/edit',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/medicine-form/medicine-form.page').then(m => m.MedicineFormPage)
  },
  {
    path: 'stock',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/stock-list/stock-list.page').then(m => m.StockListPage)
  },
  {
    path: 'stock/adjust',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/stock-adjustment/stock-adjustment.page').then(m => m.StockAdjustmentPage)
  },
  {
    path: 'scan-bill',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/bill-scan/bill-scan.page').then(m => m.BillScanPage)
  },
  {
    path: 'scan-medicine',
    canActivate: [roleGuard],
    data: { roles: INVENTORY_ROLES },
    loadComponent: () => import('./pages/medicine-scan/medicine-scan.page').then(m => m.MedicineScanPage)
  }
];
