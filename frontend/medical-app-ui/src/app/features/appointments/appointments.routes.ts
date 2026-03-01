import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

const STAFF = ['ADMIN', 'DOCTOR', 'RECEPTIONIST'];
const ADMIN_RECEP = ['ADMIN', 'RECEPTIONIST'];

export const routes: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: STAFF },
    loadComponent: () =>
      import('./pages/list/appointments-list.page').then(m => m.AppointmentsListPage)
  },
  {
    path: 'book',
    canActivate: [roleGuard],
    data: { roles: ADMIN_RECEP },
    loadComponent: () =>
      import('./pages/booking/appointment-booking.page').then(m => m.AppointmentBookingPage)
  },
  {
    // Must be before ':id' — literal 'queue' must match before the dynamic segment
    path: 'queue',
    canActivate: [roleGuard],
    data: { roles: STAFF },
    loadComponent: () =>
      import('./pages/queue/doctor-queue.page').then(m => m.DoctorQueuePage)
  },
  {
    path: ':id',
    canActivate: [roleGuard],
    data: { roles: STAFF },
    loadComponent: () =>
      import('./pages/detail/appointment-detail.page').then(m => m.AppointmentDetailPage)
  }
];
