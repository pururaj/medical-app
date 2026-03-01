import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
  IonSpinner, IonBadge, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, checkmarkCircleOutline, hourglassOutline,
  playCircleOutline, calendarOutline, refreshOutline, peopleOutline
} from 'ionicons/icons';
import {
  AppointmentService, AppointmentDto
} from '../../../../core/services/appointment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ToastService } from '../../../../core/services/toast.service';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  SCHEDULED:   { color: 'primary',  label: 'Scheduled' },
  CONFIRMED:   { color: 'success',  label: 'Confirmed' },
  CHECKED_IN:  { color: 'warning',  label: 'Checked In' },
  IN_PROGRESS: { color: 'tertiary', label: 'In Progress' },
  COMPLETED:   { color: 'medium',   label: 'Completed' },
  CANCELLED:   { color: 'danger',   label: 'Cancelled' },
  NO_SHOW:     { color: 'danger',   label: 'No Show' },
};

@Component({
  selector: 'app-doctor-queue',
  templateUrl: 'doctor-queue.page.html',
  styleUrls: ['doctor-queue.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
    IonSpinner, IonBadge, IonRefresher, IonRefresherContent,
    IonGrid, IonRow, IonCol,
  ]
})
export class DoctorQueuePage implements OnInit, OnDestroy {
  queue: AppointmentDto[] = [];
  loading = true;
  actionInProgress: number | null = null;

  // Hardcoded doctor ID — same pattern as patientId = 1 in existing pages
  private readonly doctorId = 1;
  private pollInterval?: ReturnType<typeof setInterval>;
  private readonly POLL_MS = 30_000;

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private router: Router
  ) {
    addIcons({
      personOutline, checkmarkCircleOutline, hourglassOutline,
      playCircleOutline, calendarOutline, refreshOutline, peopleOutline
    });
  }

  ngOnInit() {
    this.loadQueue();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  // ---- Stats ----

  get totalCount():      number { return this.queue.length; }
  get checkedInCount():  number { return this.queue.filter(a => a.status === 'CHECKED_IN').length; }
  get inProgressCount(): number { return this.queue.filter(a => a.status === 'IN_PROGRESS').length; }
  get completedCount():  number { return this.queue.filter(a => a.status === 'COMPLETED').length; }

  // ---- Data ----

  loadQueue(event?: any) {
    this.loading = !event;
    this.appointmentService.getTodayQueue(this.doctorId).subscribe({
      next: async (res) => {
        const fresh = res.data ?? [];
        await this.notificationService.checkForStatusChanges(fresh);
        this.queue = fresh;
        this.loading = false;
        event?.target?.complete();
      },
      error: () => {
        this.loading = false;
        event?.target?.complete();
      }
    });
  }

  // ---- Polling ----

  private startPolling() {
    this.pollInterval = setInterval(() => this.poll(), this.POLL_MS);
  }

  private stopPolling() {
    if (this.pollInterval !== undefined) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }

  private poll() {
    this.appointmentService.getTodayQueue(this.doctorId).subscribe({
      next: async (res) => {
        const fresh = res.data ?? [];
        await this.notificationService.checkForStatusChanges(fresh);
        this.queue = fresh;
      },
      error: () => { /* silent on poll errors */ }
    });
  }

  // ---- Actions ----

  onAction(appt: AppointmentDto) {
    switch (appt.status) {
      case 'SCHEDULED':
      case 'CONFIRMED':   this.checkIn(appt); break;
      case 'CHECKED_IN':  this.startConsultation(appt); break;
      case 'IN_PROGRESS': this.complete(appt); break;
    }
  }

  private checkIn(appt: AppointmentDto) {
    if (!appt.id) return;
    this.actionInProgress = appt.id;
    this.appointmentService.checkIn(appt.id).subscribe({
      next: async (res) => {
        this.replaceInQueue(res.data);
        this.actionInProgress = null;
        await this.toastService.showSuccess(`${appt.patientName} checked in (Token #${appt.tokenNumber})`);
      },
      error: async () => {
        this.actionInProgress = null;
        await this.toastService.showError('Check-in failed. Please try again.');
      }
    });
  }

  private startConsultation(appt: AppointmentDto) {
    if (!appt.id) return;
    this.actionInProgress = appt.id;
    this.appointmentService.startConsultation(appt.id).subscribe({
      next: async (res) => {
        this.replaceInQueue(res.data);
        this.actionInProgress = null;
        await this.toastService.showSuccess(`Consultation started for ${appt.patientName}`);
      },
      error: async () => {
        this.actionInProgress = null;
        await this.toastService.showError('Could not start consultation.');
      }
    });
  }

  private complete(appt: AppointmentDto) {
    if (!appt.id) return;
    this.actionInProgress = appt.id;
    this.appointmentService.completeAppointment(appt.id).subscribe({
      next: async (res) => {
        this.replaceInQueue(res.data);
        this.actionInProgress = null;
        await this.toastService.showSuccess(`Appointment completed for ${appt.patientName}`);
      },
      error: async () => {
        this.actionInProgress = null;
        await this.toastService.showError('Could not complete appointment.');
      }
    });
  }

  // ---- UI helpers ----

  isActionable(status?: string): boolean {
    return ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(status ?? '');
  }

  getActionLabel(status?: string): string {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':   return 'Check In';
      case 'CHECKED_IN':  return 'Start Consult';
      case 'IN_PROGRESS': return 'Complete';
      default:            return '';
    }
  }

  getActionColor(status?: string): string {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':   return 'warning';
      case 'CHECKED_IN':  return 'primary';
      case 'IN_PROGRESS': return 'success';
      default:            return 'medium';
    }
  }

  getStatusConfig(status?: string) {
    return STATUS_CONFIG[status ?? ''] ?? { color: 'medium', label: status ?? '' };
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  private replaceInQueue(updated: AppointmentDto) {
    const idx = this.queue.findIndex(a => a.id === updated.id);
    if (idx !== -1) {
      this.queue = [...this.queue.slice(0, idx), updated, ...this.queue.slice(idx + 1)];
    }
  }
}
