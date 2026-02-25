import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton,
  IonModal, IonTextarea, IonChip, IonGrid, IonRow, IonCol, IonSpinner, IonText,
  IonNote, IonProgressBar, IonBadge, IonSearchbar,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, arrowForwardOutline, calendarOutline, timeOutline,
  personOutline, medkitOutline, checkmarkCircleOutline, checkmarkDoneOutline,
  alertCircleOutline, closeOutline, starOutline, cashOutline, searchOutline
} from 'ionicons/icons';

import { AppointmentService, AppointmentBookingRequest, TimeSlotDto } from '../../../../core/services/appointment.service';
import { DoctorService, DoctorDto } from '../../../../core/services/doctor.service';

type WizardStep = 'doctor' | 'date' | 'time' | 'details' | 'confirm';
type AppointmentType = 'NEW_VISIT' | 'FOLLOW_UP' | 'EMERGENCY' | 'TELEMEDICINE';

const STEPS: WizardStep[] = ['doctor', 'date', 'time', 'details', 'confirm'];

@Component({
  selector: 'app-appointment-booking',
  templateUrl: 'appointment-booking.page.html',
  styleUrls: ['appointment-booking.page.scss'],
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton,
    IonModal, IonTextarea, IonChip, IonGrid, IonRow, IonCol, IonSpinner, IonText,
    IonNote, IonProgressBar, IonBadge, IonSearchbar
  ]
})
export class AppointmentBookingPage implements OnInit {
  currentStep: WizardStep = 'doctor';

  // --- Step 1: Doctor ---
  doctors: DoctorDto[] = [];
  loadingDoctors = false;
  selectedDoctor?: DoctorDto;
  doctorSearch = '';

  // --- Step 2: Date ---
  selectedIsoDate = '';  // ISO string from ion-datetime
  selectedDate = '';     // YYYY-MM-DD

  minDate: string;
  maxDate: string;

  // --- Step 3: Time ---
  timeSlots: TimeSlotDto[] = [];
  loadingSlots = false;
  selectedTime = '';

  // --- Step 4: Details ---
  appointmentType: AppointmentType = 'NEW_VISIT';
  reasonForVisit = '';
  symptoms = '';

  // --- State ---
  isBooking = false;
  bookingDone = false;
  bookedTokenNumber?: number;

  // Computed
  get stepIndex(): number { return STEPS.indexOf(this.currentStep); }
  get progress(): number { return (this.stepIndex + 1) / STEPS.length; }

  get filteredDoctors(): DoctorDto[] {
    const q = this.doctorSearch.trim().toLowerCase();
    if (!q) return this.doctors;
    return this.doctors.filter(d =>
      this.getDoctorName(d).toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.hospitalName ?? '').toLowerCase().includes(q)
    );
  }

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      arrowBackOutline, arrowForwardOutline, calendarOutline, timeOutline,
      personOutline, medkitOutline, checkmarkCircleOutline, checkmarkDoneOutline,
      alertCircleOutline, closeOutline, starOutline, cashOutline, searchOutline
    });

    const today = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 60);
    this.minDate = today.toISOString();
    this.maxDate = max.toISOString();
  }

  ngOnInit() {
    // Check if a doctor was passed via router state (from doctors list / detail page)
    const nav = this.router.getCurrentNavigation();
    const preselected = nav?.extras?.state?.['doctor'] as DoctorDto | undefined;

    this.loadDoctors(preselected);
  }

  loadDoctors(preselected?: DoctorDto) {
    this.loadingDoctors = true;
    this.doctorService.getAvailableDoctors().subscribe({
      next: (res) => {
        const page = res.data as any;
        this.doctors = page?.content ?? page ?? [];
        this.loadingDoctors = false;

        if (preselected) {
          // Pre-select the doctor passed from the doctors page
          const found = this.doctors.find(d => d.id === preselected.id);
          this.selectedDoctor = found ?? preselected;
          this.currentStep = 'date';
        }
      },
      error: () => {
        this.doctors = [];
        this.loadingDoctors = false;
      }
    });
  }

  // ---- Navigation --------------------------------------------------------

  goBack() {
    const idx = this.stepIndex;
    if (idx === 0) {
      this.router.navigate(['/appointments']);
    } else {
      this.currentStep = STEPS[idx - 1];
    }
  }

  // ---- Step 1: Doctor selection ------------------------------------------

  pickDoctor(doctor: DoctorDto) {
    if (!doctor.available) return;
    this.selectedDoctor = doctor;
    this.currentStep = 'date';
  }

  getDoctorName(d: DoctorDto): string {
    return d.fullName ?? `Dr. ${d.firstName} ${d.lastName}`;
  }

  // ---- Step 2: Date selection --------------------------------------------

  onDateChange(event: any) {
    const val: string = event.detail.value;
    if (!val) return;
    this.selectedIsoDate = val;
    this.selectedDate = val.substring(0, 10);
    this.selectedTime = '';
    this.timeSlots = [];
    this.fetchTimeSlots();
  }

  confirmDate() {
    if (!this.selectedDate) return;
    this.currentStep = 'time';
  }

  // ---- Step 3: Time slots -----------------------------------------------

  private fetchTimeSlots() {
    if (!this.selectedDoctor || !this.selectedDate) return;
    this.loadingSlots = true;
    this.appointmentService.getAvailableSlots(this.selectedDoctor.id, this.selectedDate).subscribe({
      next: (res) => {
        this.timeSlots = res.data ?? [];
        this.loadingSlots = false;
      },
      error: () => {
        // Generate mock slots so UI is usable without backend
        this.timeSlots = this.generateMockSlots();
        this.loadingSlots = false;
      }
    });
  }

  private generateMockSlots(): TimeSlotDto[] {
    const slots: TimeSlotDto[] = [];
    for (let h = 9; h <= 17; h++) {
      for (const m of [0, 30]) {
        if (h === 13) continue; // lunch break
        const available = Math.random() > 0.3;
        const t = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
        slots.push({
          startTime: t,
          endTime: `${String(h + (m === 30 ? 1 : 0)).padStart(2,'0')}:${String(m === 30 ? 0 : 30).padStart(2,'0')}:00`,
          available,
          availableSlots: available ? 1 : 0,
          bookedSlots: available ? 0 : 1
        });
      }
    }
    return slots;
  }

  pickTimeSlot(slot: TimeSlotDto) {
    if (!slot.available) return;
    // startTime comes back as "09:00:00" — strip seconds for the booking request
    this.selectedTime = slot.startTime.substring(0, 5);
    setTimeout(() => { this.currentStep = 'details'; }, 300);
  }

  // ---- Step 4: Details ---------------------------------------------------

  async proceedToConfirm() {
    if (!this.reasonForVisit.trim()) {
      const toast = await this.toastController.create({
        message: 'Please enter a reason for your visit.',
        duration: 2000, color: 'warning', position: 'top'
      });
      await toast.present();
      return;
    }
    this.currentStep = 'confirm';
  }

  // ---- Step 5: Confirm & Book --------------------------------------------

  async confirmBooking() {
    if (!this.selectedDoctor) return;

    const loading = await this.loadingController.create({ message: 'Booking your appointment…' });
    await loading.present();
    this.isBooking = true;

    const req: AppointmentBookingRequest = {
      patientId: 1, // replace with auth service
      patientName: 'John Doe', // replace with auth service
      patientPhone: '+1234567890',
      patientEmail: 'john.doe@example.com',
      doctorId: this.selectedDoctor.id,
      doctorName: this.getDoctorName(this.selectedDoctor),
      specialization: this.selectedDoctor.specialization,
      appointmentDate: this.selectedDate,
      appointmentTime: this.selectedTime,
      type: this.appointmentType,
      reasonForVisit: this.reasonForVisit,
      symptoms: this.symptoms
    };

    this.appointmentService.bookAppointment(req).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.isBooking = false;
        this.bookedTokenNumber = res.data?.tokenNumber;
        this.bookingDone = true;
      },
      error: async (err) => {
        await loading.dismiss();
        this.isBooking = false;
        const msg = err?.error?.message ?? 'Booking failed. Please try again.';
        const toast = await this.toastController.create({
          message: msg, duration: 3000, color: 'danger', position: 'top'
        });
        await toast.present();
      }
    });
  }

  goToAppointments() {
    this.router.navigate(['/appointments']);
  }

  bookAnother() {
    this.currentStep = 'doctor';
    this.selectedDoctor = undefined;
    this.selectedDate = '';
    this.selectedIsoDate = '';
    this.selectedTime = '';
    this.reasonForVisit = '';
    this.symptoms = '';
    this.bookingDone = false;
    this.bookedTokenNumber = undefined;
  }

  // ---- Helpers -----------------------------------------------------------

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatTime(t: string): string {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  typeLabel(type: AppointmentType): string {
    return { NEW_VISIT: 'New Visit', FOLLOW_UP: 'Follow-up', EMERGENCY: 'Emergency', TELEMEDICINE: 'Telemedicine' }[type];
  }

  stepLabel(step: WizardStep): string {
    return { doctor: 'Doctor', date: 'Date', time: 'Time', details: 'Details', confirm: 'Confirm' }[step];
  }
}
