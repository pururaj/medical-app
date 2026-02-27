import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonFab, IonFabButton, IonSearchbar, IonCard, IonCardContent,
  IonChip, IonLabel, IonSpinner, IonText, IonIcon, IonBadge,
  IonRefresher, IonRefresherContent, IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, personOutline, calendarOutline, callOutline,
  mailOutline, medkitOutline, searchOutline, peopleOutline
} from 'ionicons/icons';
import { PatientService, PatientDto } from '../../core/services/patient.service';

@Component({
  selector: 'app-patients-list',
  templateUrl: 'patients-list.page.html',
  styleUrls: ['patients-list.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonFab, IonFabButton, IonSearchbar, IonCard, IonCardContent,
    IonChip, IonLabel, IonSpinner, IonText, IonIcon, IonBadge,
    IonRefresher, IonRefresherContent, IonItem
  ]
})
export class PatientsListPage implements OnInit {
  patients: PatientDto[] = [];
  loading = false;
  searchTimeout: any;

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {
    addIcons({
      addOutline, personOutline, calendarOutline, callOutline,
      mailOutline, medkitOutline, searchOutline, peopleOutline
    });
  }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients(event?: any) {
    this.loading = true;
    this.patientService.getAllPatients().subscribe({
      next: (res) => {
        const page = res.data as any;
        this.patients = page?.content ?? page ?? [];
        this.loading = false;
        event?.target?.complete();
      },
      error: () => {
        this.patients = [];
        this.loading = false;
        event?.target?.complete();
      }
    });
  }

  onSearch(event: any) {
    const q = event.detail.value?.trim();
    clearTimeout(this.searchTimeout);
    if (!q) { this.loadPatients(); return; }
    this.searchTimeout = setTimeout(() => {
      this.loading = true;
      this.patientService.searchPatients(q).subscribe({
        next: (res) => {
          const page = res.data as any;
          this.patients = page?.content ?? page ?? [];
          this.loading = false;
        },
        error: () => { this.patients = []; this.loading = false; }
      });
    }, 400);
  }

  viewPatient(patient: PatientDto) {
    this.router.navigate(['/patients', patient.id]);
  }

  addPatient() {
    this.router.navigate(['/patients/register']);
  }

  getAge(dob: string): number {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getInitials(p: PatientDto): string {
    return `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase();
  }
}
