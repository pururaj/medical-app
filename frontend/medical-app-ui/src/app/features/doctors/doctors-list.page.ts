import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonSearchbar, IonCard, IonCardContent, IonChip, IonLabel,
  IonSpinner, IonText, IonSelect, IonSelectOption, IonRefresher,
  IonRefresherContent, IonIcon, IonBadge, IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  starOutline, cashOutline, timeOutline, medkitOutline,
  personOutline, locationOutline, filterOutline, calendarOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { DoctorService, DoctorDto } from '../../core/services/doctor.service';

@Component({
  selector: 'app-doctors-list',
  templateUrl: 'doctors-list.page.html',
  styleUrls: ['doctors-list.page.scss'],
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonSearchbar, IonCard, IonCardContent, IonChip, IonLabel,
    IonSpinner, IonText, IonSelect, IonSelectOption, IonRefresher,
    IonRefresherContent, IonIcon, IonBadge, IonItem
  ]
})
export class DoctorsListPage implements OnInit {
  doctors: DoctorDto[] = [];
  specializations: string[] = [];
  loading = false;

  searchQuery = '';
  selectedSpecialization = '';
  showAvailableOnly = false;

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) {
    addIcons({
      starOutline, cashOutline, timeOutline, medkitOutline,
      personOutline, locationOutline, filterOutline, calendarOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.loadSpecializations();
    this.loadDoctors();
  }

  loadSpecializations() {
    this.doctorService.getSpecializations().subscribe({
      next: (res) => { this.specializations = res.data ?? []; },
      error: () => { this.specializations = []; }
    });
  }

  loadDoctors(event?: any) {
    this.loading = true;
    const spec = this.selectedSpecialization || undefined;
    const avail = this.showAvailableOnly ? true : undefined;

    this.doctorService.searchDoctors(spec, undefined, avail).subscribe({
      next: (res) => {
        const page = res.data as any;
        this.doctors = page?.content ?? page ?? [];
        this.loading = false;
        event?.target?.complete();
      },
      error: () => {
        this.doctors = [];
        this.loading = false;
        event?.target?.complete();
      }
    });
  }

  get filteredDoctors(): DoctorDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.doctors;
    return this.doctors.filter(d =>
      (d.fullName ?? `Dr. ${d.firstName} ${d.lastName}`).toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.hospitalName ?? '').toLowerCase().includes(q)
    );
  }

  onFilterChange() {
    this.loadDoctors();
  }

  bookAppointment(doctor: DoctorDto) {
    this.router.navigate(['/appointments/book'], { state: { doctor } });
  }

  viewDoctor(doctor: DoctorDto) {
    this.router.navigate(['/doctors', doctor.id]);
  }

  getDoctorName(d: DoctorDto): string {
    return d.fullName ?? `Dr. ${d.firstName} ${d.lastName}`;
  }
}
