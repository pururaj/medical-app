import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
  IonSpinner, IonText, IonBadge, IonItem, IonAlert,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, calendarOutline, callOutline, mailOutline,
  medkitOutline, locationOutline, peopleOutline, createOutline,
  trashOutline, alertCircleOutline, cardOutline, waterOutline
} from 'ionicons/icons';
import { PatientService, PatientDto } from '../../../../core/services/patient.service';

@Component({
  selector: 'app-patient-detail',
  templateUrl: 'patient-detail.page.html',
  styleUrls: ['patient-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
    IonSpinner, IonText, IonBadge, IonItem, IonAlert,
  ]
})
export class PatientDetailPage implements OnInit {
  patient?: PatientDto;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      personOutline, calendarOutline, callOutline, mailOutline,
      medkitOutline, locationOutline, peopleOutline, createOutline,
      trashOutline, alertCircleOutline, cardOutline, waterOutline
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) { this.loadPatient(id); }
    else { this.error = 'Invalid patient ID'; this.loading = false; }
  }

  loadPatient(id: number) {
    this.patientService.getPatientById(id).subscribe({
      next: (res) => { this.patient = res.data; this.loading = false; },
      error: () => { this.error = 'Failed to load patient profile.'; this.loading = false; }
    });
  }

  getAddress(): string {
    if (!this.patient) return '—';
    const parts = [
      this.patient.address, this.patient.city,
      this.patient.state, this.patient.zipCode, this.patient.country
    ];
    return parts.filter(p => p && p.trim()).join(', ') || '—';
  }

  getAge(): number {
    if (!this.patient?.dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(this.patient.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  getInitials(): string {
    if (!this.patient) return '';
    return `${this.patient.firstName[0]}${this.patient.lastName[0]}`.toUpperCase();
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  editPatient() {
    this.router.navigate(['/patients', this.patient?.id, 'edit']);
  }

  goToFamilyMembers() {
    this.router.navigate(['/patients', this.patient?.id, 'family']);
  }

  bookAppointment() {
    this.router.navigate(['/appointments/book']);
  }

  async confirmDeactivate() {
    const alert = await this.alertCtrl.create({
      header: 'Deactivate Patient?',
      message: `This will deactivate ${this.patient?.firstName}'s account. They won't be able to make appointments.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Deactivate',
          role: 'destructive',
          handler: () => this.deactivate()
        }
      ]
    });
    await alert.present();
  }

  private deactivate() {
    if (!this.patient?.id) return;
    this.patientService.deletePatient(this.patient.id).subscribe({
      next: async () => {
        const t = await this.toastCtrl.create({
          message: 'Patient deactivated successfully.', duration: 2000, color: 'success', position: 'top'
        });
        await t.present();
        this.router.navigate(['/patients']);
      },
      error: async () => {
        const t = await this.toastCtrl.create({
          message: 'Failed to deactivate patient.', duration: 2000, color: 'danger', position: 'top'
        });
        await t.present();
      }
    });
  }
}
