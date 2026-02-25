import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/appointments-list.page').then(m => m.AppointmentsListPage)
  },
  {
    path: 'book',
    loadComponent: () =>
      import('./pages/booking/appointment-booking.page').then(m => m.AppointmentBookingPage)
  }
];
