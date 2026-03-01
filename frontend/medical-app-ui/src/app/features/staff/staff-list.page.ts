import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonSearchbar, IonCard, IonCardContent, IonChip, IonLabel,
  IonSpinner, IonText, IonSelect, IonSelectOption, IonRefresher,
  IonRefresherContent, IonIcon, IonBadge, IonItem, IonItemSliding,
  IonItemOptions, IonItemOption, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, personOutline, briefcaseOutline, timeOutline,
  mailOutline, trashOutline, chevronForwardOutline, peopleCircleOutline,
  checkmarkCircleOutline, closeCircleOutline, filterOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { StaffService, StaffDto } from '../../core/services/staff.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-staff-list',
  templateUrl: 'staff-list.page.html',
  styleUrls: ['staff-list.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonSearchbar, IonCard, IonCardContent, IonChip, IonLabel,
    IonSpinner, IonText, IonSelect, IonSelectOption, IonRefresher,
    IonRefresherContent, IonIcon, IonBadge, IonItem, IonItemSliding,
    IonItemOptions, IonItemOption
  ]
})
export class StaffListPage implements OnInit {
  staff: StaffDto[] = [];
  loading = false;

  searchQuery = '';
  selectedRole = '';

  readonly roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'NURSE', label: 'Nurse' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LAB_TECH', label: 'Lab Technician' },
  ];

  constructor(
    private staffService: StaffService,
    private toastService: ToastService,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    addIcons({
      addOutline, personOutline, briefcaseOutline, timeOutline,
      mailOutline, trashOutline, chevronForwardOutline, peopleCircleOutline,
      checkmarkCircleOutline, closeCircleOutline, filterOutline,
      shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff(event?: any) {
    this.loading = true;
    const role = this.selectedRole || undefined;
    const keyword = this.searchQuery.trim() || undefined;

    this.staffService.getStaff(role, keyword).subscribe({
      next: (res) => {
        this.staff = res.data?.content ?? [];
        this.loading = false;
        event?.target?.complete();
      },
      error: () => {
        this.staff = [];
        this.loading = false;
        event?.target?.complete();
      }
    });
  }

  onFilterChange() {
    this.loadStaff();
  }

  onSearchChange() {
    this.loadStaff();
  }

  viewStaff(member: StaffDto) {
    this.router.navigate(['/staff', member.id]);
  }

  addStaff() {
    this.router.navigate(['/staff/new']);
  }

  async confirmDelete(member: StaffDto, slidingItem: IonItemSliding) {
    await slidingItem.close();
    const alert = await this.alertCtrl.create({
      header: 'Deactivate Staff',
      message: `Are you sure you want to deactivate ${member.firstName} ${member.lastName}? They will no longer be able to log in.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Deactivate',
          role: 'destructive',
          handler: () => this.deleteStaff(member)
        }
      ]
    });
    await alert.present();
  }

  private deleteStaff(member: StaffDto) {
    this.staffService.deleteStaff(member.id).subscribe({
      next: () => {
        this.toastService.showSuccess(`${member.firstName} ${member.lastName} has been deactivated.`);
        this.loadStaff();
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
      LAB_TECH: 'Lab Tech'
    };
    return labels[role] ?? role;
  }

  getShiftLabel(shift?: string): string {
    const labels: Record<string, string> = {
      MORNING: 'Morning',
      AFTERNOON: 'Afternoon',
      NIGHT: 'Night',
      ROTATIONAL: 'Rotational'
    };
    return shift ? (labels[shift] ?? shift) : '—';
  }
}
