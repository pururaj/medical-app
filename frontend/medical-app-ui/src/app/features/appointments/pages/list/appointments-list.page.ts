import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
  IonSpinner,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
  refreshOutline
} from 'ionicons/icons';

import {
  AppointmentService,
  AppointmentDto
} from '../../../../core/services/appointment.service';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  SCHEDULED:  { color: 'primary',  label: 'Scheduled',   icon: 'calendar-outline' },
  CONFIRMED:  { color: 'success',  label: 'Confirmed',   icon: 'checkmark-circle-outline' },
  CHECKED_IN: { color: 'warning',  label: 'Checked In',  icon: 'person-outline' },
  IN_PROGRESS:{ color: 'tertiary', label: 'In Progress', icon: 'hourglass-outline' },
  COMPLETED:  { color: 'medium',   label: 'Completed',   icon: 'checkmark-circle-outline' },
  CANCELLED:  { color: 'danger',   label: 'Cancelled',   icon: 'close-circle-outline' },
  NO_SHOW:    { color: 'danger',   label: 'No Show',     icon: 'close-circle-outline' },
  RESCHEDULED:{ color: 'warning',  label: 'Rescheduled', icon: 'refresh-outline' }
};

@Component({
  selector: 'app-appointments-list',
  templateUrl: 'appointments-list.page.html',
  styleUrls: ['appointments-list.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons,
    IonFab, IonFabButton, IonIcon, IonCard, IonCardContent,
    IonChip, IonLabel, IonSpinner, IonText, IonSegment, IonSegmentButton,
    IonRefresher, IonRefresherContent
  ]
})
export class AppointmentsListPage implements OnInit {
  appointments: AppointmentDto[] = [];
  filteredAppointments: AppointmentDto[] = [];
  loading = false;
  selectedFilter: 'upcoming' | 'completed' | 'all' = 'upcoming';

  // Mock patient id — replace with auth service
  private patientId = 1;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    addIcons({
      addOutline, calendarOutline, timeOutline, personOutline,
      checkmarkCircleOutline, closeCircleOutline, hourglassOutline, refreshOutline
    });
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments(event?: any) {
    this.loading = true;
    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (response) => {
        // Backend returns a PageResponse: { content: [...], pageNumber, totalElements, ... }
        const pageData = response.data as any;
        this.appointments = pageData?.content ?? pageData ?? [];
        this.applyFilter();
        this.loading = false;
        event?.target?.complete();
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        this.appointments = [];
        this.applyFilter();
      }
    });
  }

  applyFilter() {
    const now = new Date();
    switch (this.selectedFilter) {
      case 'upcoming':
        this.filteredAppointments = this.appointments.filter(a => {
          const d = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
          return d >= now && a.status !== 'CANCELLED' && a.status !== 'COMPLETED';
        });
        break;
      case 'completed':
        this.filteredAppointments = this.appointments.filter(
          a => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW'
        );
        break;
      default:
        this.filteredAppointments = [...this.appointments];
    }
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
  }

  bookAppointment() {
    this.router.navigate(['/appointments/book']);
  }

  getStatusConfig(status: string) {
    return STATUS_CONFIG[status] ?? { color: 'medium', label: status, icon: 'calendar-outline' };
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }
}
