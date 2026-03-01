import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonDatetime,
  IonModal, IonSpinner, IonText, IonProgressBar, IonNote,
  IonChip, IonDatetimeButton,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, medkitOutline, callOutline, checkmarkCircleOutline,
  arrowForwardOutline, arrowBackOutline, checkmarkDoneOutline
} from 'ionicons/icons';
import { PatientService, PatientDto } from '../../../../core/services/patient.service';

type Step = 'personal' | 'medical' | 'emergency';
const STEPS: Step[] = ['personal', 'medical', 'emergency'];

@Component({
  selector: 'app-patient-registration',
  templateUrl: 'patient-registration.page.html',
  styleUrls: ['patient-registration.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea, IonDatetime,
    IonModal, IonSpinner, IonText, IonProgressBar, IonNote,
    IonChip, IonDatetimeButton
  ]
})
export class PatientRegistrationPage implements OnInit {
  currentStep: Step = 'personal';
  registrationDone = false;
  createdPatientId?: number;

  // Pre-fill mode (when registering a family member)
  isFamilyMember = false;
  primaryPatientId?: number;

  // Forms
  personalForm!: FormGroup;
  medicalForm!: FormGroup;
  emergencyForm!: FormGroup;

  maxDob: string;

  get stepIndex() { return STEPS.indexOf(this.currentStep); }
  get progress() { return (this.stepIndex + 1) / STEPS.length; }

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      personOutline, medkitOutline, callOutline, checkmarkCircleOutline,
      arrowForwardOutline, arrowBackOutline, checkmarkDoneOutline
    });
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.maxDob = today.toISOString();
  }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as any;
    if (state?.primaryPatientId) {
      this.isFamilyMember = true;
      this.primaryPatientId = state.primaryPatientId;
    }

    this.personalForm = this.fb.group({
      firstName:   ['', [Validators.required, Validators.maxLength(100)]],
      lastName:    ['', [Validators.required, Validators.maxLength(100)]],
      email:       ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,20}$/)]],
      dateOfBirth: ['', Validators.required],
      gender:      ['', Validators.required],
      address:     [''],
      city:        [''],
      state:       [''],
      zipCode:     [''],
      country:     ['India']
    });

    this.medicalForm = this.fb.group({
      bloodType:     [''],
      allergies:     [''],
      medicalHistory:['']
    });

    this.emergencyForm = this.fb.group({
      emergencyContactName:  [''],
      emergencyContactPhone: ['', [Validators.pattern(/^\+?[0-9]{10,20}$/)]]
    });
  }

  onDobChange(event: any) {
    const val: string = event.detail.value;
    if (val) {
      this.personalForm.patchValue({ dateOfBirth: val.substring(0, 10) });
    }
  }

  // ---- Navigation ----

  goBack() {
    if (this.stepIndex === 0) {
      this.router.navigate(['/patients']);
    } else {
      this.currentStep = STEPS[this.stepIndex - 1];
    }
  }

  nextStep() {
    if (this.currentStep === 'personal') {
      this.personalForm.markAllAsTouched();
      if (this.personalForm.invalid) {
        this.showToast('Please fill in all required fields correctly.', 'warning');
        return;
      }
      this.currentStep = 'medical';
    } else if (this.currentStep === 'medical') {
      this.currentStep = 'emergency';
    }
  }

  // ---- Submit ----

  async submitRegistration() {
    this.emergencyForm.markAllAsTouched();
    if (this.emergencyForm.invalid) {
      this.showToast('Please check emergency contact details.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Registering patient…' });
    await loading.present();

    const raw = {
      ...this.personalForm.value,
      ...this.medicalForm.value,
      ...this.emergencyForm.value
    };
    // Convert empty strings to undefined so backend @Pattern validators don't reject optional fields
    const payload: PatientDto = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v === '' ? undefined : v])
    ) as unknown as PatientDto;

    this.patientService.createPatient(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.createdPatientId = res.data?.id;
        this.registrationDone = true;
      },
      error: async (err) => {
        await loading.dismiss();
        const msg = err?.error?.message ?? 'Registration failed. Please try again.';
        this.showToast(msg, 'danger');
      }
    });
  }

  viewProfile() {
    if (this.createdPatientId) {
      this.router.navigate(['/patients', this.createdPatientId]);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  registerAnother() {
    this.personalForm.reset({ country: 'India' });
    this.medicalForm.reset();
    this.emergencyForm.reset();
    this.currentStep = 'personal';
    this.registrationDone = false;
    this.createdPatientId = undefined;
  }

  stepLabel(s: Step) {
    return { personal: 'Personal', medical: 'Medical', emergency: 'Emergency' }[s];
  }

  hasError(form: FormGroup, field: string, error: string) {
    const c = form.get(field);
    return c?.touched && c?.hasError(error);
  }

  private async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    await t.present();
  }
}
