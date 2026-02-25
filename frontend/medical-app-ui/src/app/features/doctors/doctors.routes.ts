import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./doctors-list.page').then(m => m.DoctorsListPage)
  }
];
