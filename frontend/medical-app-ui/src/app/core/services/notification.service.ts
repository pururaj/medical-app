import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';
import { AppointmentDto } from './appointment.service';

interface StatusNotificationConfig {
  message: string;
  type: 'success' | 'warning' | 'info';
}

const STATUS_MESSAGES: Record<string, StatusNotificationConfig> = {
  CONFIRMED:   { message: 'Your appointment has been confirmed!', type: 'success' },
  CHECKED_IN:  { message: 'You are now checked in. Please wait to be called.', type: 'info' },
  IN_PROGRESS: { message: 'Doctor is ready for you — your consultation has started!', type: 'success' },
  COMPLETED:   { message: 'Your consultation is complete. Thank you for visiting!', type: 'success' },
  CANCELLED:   { message: 'Your appointment has been cancelled.', type: 'warning' },
  NO_SHOW:     { message: 'You were marked as a no-show. Please rebook if needed.', type: 'warning' },
  RESCHEDULED: { message: 'Your appointment has been rescheduled.', type: 'info' },
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Persists across polling cycles — keyed by appointmentId
  private lastKnownStatuses = new Map<number, string>();

  constructor(private toastService: ToastService) {}

  /**
   * Compare fresh appointment list against last-known statuses.
   * Shows a toast for every appointment whose status changed.
   * Silently seeds on first encounter (no toast on initial load).
   */
  async checkForStatusChanges(appointments: AppointmentDto[]): Promise<void> {
    for (const appt of appointments) {
      if (!appt.id || !appt.status) continue;

      const previous = this.lastKnownStatuses.get(appt.id);

      if (previous === undefined) {
        // First poll — seed silently, no toast
        this.lastKnownStatuses.set(appt.id, appt.status);
        continue;
      }

      if (previous !== appt.status) {
        this.lastKnownStatuses.set(appt.id, appt.status);
        await this.showStatusChangeToast(appt);
      }
    }
  }

  private async showStatusChangeToast(appt: AppointmentDto): Promise<void> {
    const cfg = STATUS_MESSAGES[appt.status ?? ''];
    if (!cfg) return;

    const msg = appt.tokenNumber
      ? `Token #${appt.tokenNumber} — ${cfg.message}`
      : cfg.message;

    switch (cfg.type) {
      case 'success': await this.toastService.showSuccess(msg, 4000); break;
      case 'warning': await this.toastService.showWarning(msg, 4000); break;
      case 'info':    await this.toastService.showInfo(msg, 4000);    break;
    }
  }

  clearAll(): void {
    this.lastKnownStatuses.clear();
  }
}
