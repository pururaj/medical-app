import { Component, OnInit, OnDestroy } from '@angular/core';
import { TitleCasePipe, SlicePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonChip, IonLabel, IonSpinner, IonText, IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, timeOutline, personOutline, checkmarkCircleOutline,
  closeCircleOutline, hourglassOutline, medkitOutline, refreshOutline,
  peopleOutline, timerOutline
} from 'ionicons/icons';
import {
  AppointmentService, AppointmentDto, QueueStatusDto
} from '../../../../core/services/appointment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ToastService } from '../../../../core/services/toast.service';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  SCHEDULED:   { color: 'primary',  label: 'Scheduled',   icon: 'calendar-outline' },
  CONFIRMED:   { color: 'success',  label: 'Confirmed',   icon: 'checkmark-circle-outline' },
  CHECKED_IN:  { color: 'warning',  label: 'Checked In',  icon: 'person-outline' },
  IN_PROGRESS: { color: 'tertiary', label: 'In Progress', icon: 'hourglass-outline' },
  COMPLETED:   { color: 'medium',   label: 'Completed',   icon: 'checkmark-circle-outline' },
  CANCELLED:   { color: 'danger',   label: 'Cancelled',   icon: 'close-circle-outline' },
  NO_SHOW:     { color: 'danger',   label: 'No Show',     icon: 'close-circle-outline' },
  RESCHEDULED: { color: 'warning',  label: 'Rescheduled', icon: 'refresh-outline' },
};

const STATUS_TIMELINE = ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'];

@Component({
  selector: 'app-appointment-detail',
  templateUrl: 'appointment-detail.page.html',
  styleUrls: ['appointment-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonChip, IonLabel, IonSpinner, IonText, IonBadge,
    TitleCasePipe, SlicePipe,
  ]
})
export class AppointmentDetailPage implements OnInit, OnDestroy {
  appointment?: AppointmentDto;
  queueStatus?: QueueStatusDto;
  loading = true;
  error = '';
  actionInProgress = false;

  readonly statusTimeline = STATUS_TIMELINE;

  private appointmentId!: number;
  private pollInterval?: ReturnType<typeof setInterval>;
  private readonly POLL_MS = 30_000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private alertController: AlertController
  ) {
    addIcons({
      calendarOutline, timeOutline, personOutline, checkmarkCircleOutline,
      closeCircleOutline, hourglassOutline, medkitOutline, refreshOutline,
      peopleOutline, timerOutline
    });
  }

  ngOnInit() {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAppointment();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private loadAppointment() {
    this.loading = true;
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: async (res) => {
        await this.notificationService.checkForStatusChanges([res.data]);
        this.appointment = res.data;
        this.loading = false;
        this.loadQueueStatus();
      },
      error: () => {
        this.error = 'Failed to load appointment details.';
        this.loading = false;
      }
    });
  }

  private loadQueueStatus() {
    this.appointmentService.getQueueStatus(this.appointmentId).subscribe({
      next: (res) => { this.queueStatus = res.data; },
      error: () => { /* queue status is supplemental — fail silently */ }
    });
  }

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
    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: async (res) => {
        await this.notificationService.checkForStatusChanges([res.data]);
        this.appointment = res.data;
        this.loadQueueStatus();
      },
      error: () => { /* stay silent on poll errors */ }
    });
  }

  // ---- Computed state ----

  get canCheckIn(): boolean {
    if (!this.appointment) return false;
    const today = new Date().toISOString().substring(0, 10);
    const s = this.appointment.status;
    return this.appointment.appointmentDate === today
      && (s === 'SCHEDULED' || s === 'CONFIRMED');
  }

  get canCancel(): boolean {
    const s = this.appointment?.status;
    return s === 'SCHEDULED' || s === 'CONFIRMED';
  }

  get showQueueWidget(): boolean {
    const s = this.appointment?.status;
    return s === 'CHECKED_IN' || s === 'IN_PROGRESS';
  }

  // ---- Actions ----

  async checkIn() {
    if (!this.appointment?.id) return;
    this.actionInProgress = true;
    this.appointmentService.checkIn(this.appointment.id).subscribe({
      next: async (res) => {
        this.appointment = res.data;
        this.loadQueueStatus();
        this.actionInProgress = false;
        await this.toastService.showSuccess('Checked in successfully!');
      },
      error: async () => {
        this.actionInProgress = false;
        await this.toastService.showError('Check-in failed. Please try at reception.');
      }
    });
  }

  async presentCancelAlert() {
    const alert = await this.alertController.create({
      header: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      inputs: [{
        name: 'reason',
        type: 'text',
        placeholder: 'Reason for cancellation (optional)'
      }],
      buttons: [
        { text: 'Keep', role: 'cancel' },
        {
          text: 'Cancel Appointment',
          role: 'destructive',
          handler: (data) => this.doCancel(data?.reason || 'Patient cancelled')
        }
      ]
    });
    await alert.present();
  }

  private doCancel(reason: string) {
    if (!this.appointment?.id) return;
    this.actionInProgress = true;
    this.appointmentService.cancelAppointment(this.appointment.id, reason, 'PATIENT').subscribe({
      next: async (res) => {
        this.appointment = res.data;
        this.actionInProgress = false;
        await this.toastService.showWarning('Appointment cancelled.');
      },
      error: async () => {
        this.actionInProgress = false;
        await this.toastService.showError('Cancellation failed. Please try again.');
      }
    });
  }

  // ---- Helpers ----

  getStatusConfig(status: string) {
    return STATUS_CONFIG[status] ?? { color: 'medium', label: status, icon: 'calendar-outline' };
  }

  isStatusReached(step: string): boolean {
    const current = STATUS_TIMELINE.indexOf(this.appointment?.status ?? '');
    const target = STATUS_TIMELINE.indexOf(step);
    return current >= 0 && current >= target;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }
}
