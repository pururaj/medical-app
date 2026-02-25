import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
  IonSpinner, IonText, IonBadge, IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, cashOutline, timeOutline, medkitOutline,
  locationOutline, starOutline, personOutline, schoolOutline, cardOutline
} from 'ionicons/icons';

import { DoctorService, DoctorDto } from '../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-detail',
  templateUrl: 'doctor-detail.page.html',
  styleUrls: ['doctor-detail.page.scss'],
  standalone: true,
  imports: [
    DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonChip, IonLabel,
    IonSpinner, IonText, IonBadge, IonItem
  ]
})
export class DoctorDetailPage implements OnInit {
  doctor?: DoctorDto;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {
    addIcons({
      calendarOutline, cashOutline, timeOutline, medkitOutline,
      locationOutline, starOutline, personOutline, schoolOutline, cardOutline
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadDoctor(id);
    } else {
      this.error = 'Invalid doctor ID';
      this.loading = false;
    }
  }

  loadDoctor(id: number) {
    this.doctorService.getDoctorById(id).subscribe({
      next: (res) => {
        this.doctor = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load doctor profile.';
        this.loading = false;
      }
    });
  }

  getDoctorName(): string {
    if (!this.doctor) return '';
    return this.doctor.fullName ?? `Dr. ${this.doctor.firstName} ${this.doctor.lastName}`;
  }

  bookAppointment() {
    if (!this.doctor) return;
    this.router.navigate(['/appointments/book'], { state: { doctor: this.doctor } });
  }
}
