import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonTextarea,
  IonInput,
  IonChip,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonButtons,
  IonBackButton,
  IonNote,
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  timeOutline,
  personOutline,
  medkitOutline,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';

import { AppointmentService, AppointmentBookingRequest, TimeSlotDto } from '../../services/appointment.service';
import { PatientService, PatientDto } from '../../services/patient.service';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  consultationFee: number;
}

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.page.html',
  styleUrls: ['./appointment-booking.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonTextarea,
    IonInput,
    IonChip,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonText,
    IonButtons,
    IonBackButton,
    IonNote
  ]
})
export class AppointmentBookingPage implements OnInit {
  // Step tracking
  currentStep: 'doctor' | 'date' | 'time' | 'details' | 'confirm' = 'doctor';

  // Mock doctors data (replace with actual API call)
  doctors: Doctor[] = [
    { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiologist', consultationFee: 500 },
    { id: 2, name: 'Dr. Michael Chen', specialization: 'Pediatrician', consultationFee: 400 },
    { id: 3, name: 'Dr. Priya Sharma', specialization: 'General Physician', consultationFee: 300 },
    { id: 4, name: 'Dr. Rajesh Kumar', specialization: 'Orthopedic', consultationFee: 600 }
  ];

  // Form data
  selectedDoctor?: Doctor;
  selectedDate: string = '';
  selectedTime: string = '';
  appointmentType: 'NEW_VISIT' | 'FOLLOW_UP' | 'EMERGENCY' | 'TELEMEDICINE' = 'NEW_VISIT';
  reasonForVisit: string = '';
  symptoms: string = '';

  // Available slots
  availableSlots: TimeSlotDto[] = [];
  loadingSlots = false;

  // Current patient (from auth service)
  currentPatient?: PatientDto;

  // Booking state
  isBooking = false;
  bookingSuccess = false;
  bookingError: string = '';

  minDate: string = '';
  maxDate: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    addIcons({
      calendarOutline,
      timeOutline,
      personOutline,
      medkitOutline,
      checkmarkCircleOutline,
      alertCircleOutline
    });

    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString();

    // Set max date to 30 days from now
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    this.maxDate = maxDate.toISOString();
  }

  ngOnInit() {
    // For demo, using first patient (in real app, get from auth service)
    this.loadCurrentPatient();
  }

  loadCurrentPatient() {
    // Mock patient - replace with actual auth service
    this.currentPatient = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'MALE'
    };
  }

  // Step navigation
  selectDoctor(doctor: Doctor) {
    this.selectedDoctor = doctor;
    this.currentStep = 'date';
  }

  onDateChange(event: any) {
    const selectedDate = event.detail.value;
    if (selectedDate) {
      this.selectedDate = selectedDate.split('T')[0];
      this.loadAvailableSlots();
      this.currentStep = 'time';
    }
  }

  selectTimeSlot(slot: TimeSlotDto) {
    if (slot.available) {
      this.selectedTime = slot.time;
      this.currentStep = 'details';
    }
  }

  async loadAvailableSlots() {
    if (!this.selectedDoctor || !this.selectedDate) {
      return;
    }

    this.loadingSlots = true;
    this.appointmentService.getAvailableSlots(this.selectedDoctor.id, this.selectedDate)
      .subscribe({
        next: (response) => {
          this.availableSlots = response.data;
          this.loadingSlots = false;
        },
        error: async (error) => {
          console.error('Error loading slots:', error);
          this.loadingSlots = false;
          const toast = await this.toastController.create({
            message: 'Failed to load available time slots',
            duration: 3000,
            color: 'danger'
          });
          await toast.present();
        }
      });
  }

  async proceedToConfirm() {
    if (!this.reasonForVisit.trim()) {
      const toast = await this.toastController.create({
        message: 'Please provide a reason for visit',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.currentStep = 'confirm';
  }

  async confirmBooking() {
    if (!this.currentPatient || !this.selectedDoctor) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Appointment',
      message: `Are you sure you want to book an appointment with ${this.selectedDoctor.name} on ${this.formatDate(this.selectedDate)} at ${this.selectedTime}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.bookAppointment();
          }
        }
      ]
    });

    await alert.present();
  }

  async bookAppointment() {
    if (!this.currentPatient || !this.selectedDoctor) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Booking appointment...',
    });
    await loading.present();

    const bookingRequest: AppointmentBookingRequest = {
      patientId: this.currentPatient.id!,
      doctorId: this.selectedDoctor.id,
      appointmentDate: this.selectedDate,
      appointmentTime: this.selectedTime,
      type: this.appointmentType,
      reasonForVisit: this.reasonForVisit,
      symptoms: this.symptoms
    };

    this.isBooking = true;
    this.appointmentService.bookAppointment(bookingRequest)
      .subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isBooking = false;
          this.bookingSuccess = true;

          const toast = await this.toastController.create({
            message: 'Appointment booked successfully!',
            duration: 3000,
            color: 'success'
          });
          await toast.present();

          // Navigate to appointments list after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/tabs/home']);
          }, 2000);
        },
        error: async (error) => {
          await loading.dismiss();
          this.isBooking = false;
          this.bookingError = error.error?.message || 'Failed to book appointment';

          const toast = await this.toastController.create({
            message: this.bookingError,
            duration: 3000,
            color: 'danger'
          });
          await toast.present();
        }
      });
  }

  goBack() {
    switch (this.currentStep) {
      case 'date':
        this.currentStep = 'doctor';
        break;
      case 'time':
        this.currentStep = 'date';
        break;
      case 'details':
        this.currentStep = 'time';
        break;
      case 'confirm':
        this.currentStep = 'details';
        break;
      default:
        this.router.navigate(['/tabs/home']);
    }
  }

  resetBooking() {
    this.currentStep = 'doctor';
    this.selectedDoctor = undefined;
    this.selectedDate = '';
    this.selectedTime = '';
    this.reasonForVisit = '';
    this.symptoms = '';
    this.bookingSuccess = false;
    this.bookingError = '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getAppointmentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'NEW_VISIT': 'New Visit',
      'FOLLOW_UP': 'Follow-up',
      'EMERGENCY': 'Emergency',
      'TELEMEDICINE': 'Telemedicine'
    };
    return labels[type] || type;
  }
}
