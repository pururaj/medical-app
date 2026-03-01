import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
  IonSpinner, IonText, IonItem, IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  createOutline, trashOutline, personOutline, mailOutline, callOutline,
  briefcaseOutline, timeOutline, shieldCheckmarkOutline, calendarOutline,
  checkmarkCircleOutline, closeCircleOutline, ribbonOutline, toggleOutline,
  idCardOutline
} from 'ionicons/icons';

import { StaffService, StaffDto } from '../../../../core/services/staff.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-staff-detail',
  templateUrl: 'staff-detail.page.html',
  styleUrls: ['staff-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
    IonSpinner, IonText, IonItem, IonBadge
  ]
})
export class StaffDetailPage implements OnInit {
  staff?: StaffDto;
  loading = false;
  toggling = false;

  constructor(
    private staffService: StaffService,
    private toastService: ToastService,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({
      createOutline, trashOutline, personOutline, mailOutline, callOutline,
      briefcaseOutline, timeOutline, shieldCheckmarkOutline, calendarOutline,
      checkmarkCircleOutline, closeCircleOutline, ribbonOutline, toggleOutline,
      idCardOutline
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadStaff(id);
  }

  loadStaff(id: number) {
    this.loading = true;
    this.staffService.getStaffById(id).subscribe({
      next: (res) => {
        this.staff = res.data;
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Failed to load staff details.');
        this.loading = false;
        this.router.navigate(['/staff']);
      }
    });
  }

  editStaff() {
    this.router.navigate(['/staff', this.staff!.id, 'edit']);
  }

  async confirmToggle() {
    const action = this.staff!.active ? 'Deactivate' : 'Activate';
    const alert = await this.alertCtrl.create({
      header: `${action} Staff Member`,
      message: `Are you sure you want to ${action.toLowerCase()} ${this.staff!.firstName} ${this.staff!.lastName}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: action, handler: () => this.toggleActive() }
      ]
    });
    await alert.present();
  }

  private toggleActive() {
    this.toggling = true;
    this.staffService.toggleActive(this.staff!.id).subscribe({
      next: (res) => {
        this.staff = res.data;
        this.toggling = false;
        const msg = this.staff.active ? 'Staff member activated.' : 'Staff member deactivated.';
        this.toastService.showSuccess(msg);
      },
      error: () => {
        this.toggling = false;
        this.toastService.showError('Failed to update status.');
      }
    });
  }

  async confirmDelete() {
    const alert = await this.alertCtrl.create({
      header: 'Deactivate Staff',
      message: `This will deactivate ${this.staff!.firstName} ${this.staff!.lastName} and revoke their system access.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Deactivate',
          role: 'destructive',
          handler: () => this.deleteStaff()
        }
      ]
    });
    await alert.present();
  }

  private deleteStaff() {
    this.staffService.deleteStaff(this.staff!.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Staff member deactivated.');
        this.router.navigate(['/staff']);
      },
      error: () => this.toastService.showError('Failed to deactivate staff member.')
    });
  }

  getRoleBadgeColor(role: string): string {
    const colors: Record<string, string> = {
      ADMIN: 'primary',
      RECEPTIONIST: 'success',
      NURSE: 'tertiary',
      PHARMACIST: 'warning',
      LAB_TECH: 'medium'
    };
    return colors[role] ?? 'medium';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      RECEPTIONIST: 'Receptionist',
      NURSE: 'Nurse',
      PHARMACIST: 'Pharmacist',
      LAB_TECH: 'Lab Technician'
    };
    return labels[role] ?? role;
  }

  getShiftLabel(shift?: string): string {
    const labels: Record<string, string> = {
      MORNING: 'Morning Shift',
      AFTERNOON: 'Afternoon Shift',
      NIGHT: 'Night Shift',
      ROTATIONAL: 'Rotational Shift'
    };
    return shift ? (labels[shift] ?? shift) : 'Not specified';
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
