import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonSpinner, IonText, IonNote,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, medkitOutline, callOutline, saveOutline, alertCircleOutline
} from 'ionicons/icons';
import { PatientService, PatientDto } from '../../../../core/services/patient.service';

@Component({
  selector: 'app-patient-edit',
  templateUrl: 'patient-edit.page.html',
  styleUrls: ['patient-edit.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonTextarea,
    IonSpinner, IonText, IonNote,
  ]
})
export class PatientEditPage implements OnInit {
  patientId!: number;
  loading = true;
  error = '';

  personalForm!: FormGroup;
  medicalForm!: FormGroup;
  emergencyForm!: FormGroup;

  maxDob: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ personOutline, medkitOutline, callOutline, saveOutline, alertCircleOutline });
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.maxDob = today.toISOString().substring(0, 10);
  }

  ngOnInit() {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));

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
      country:     ['']
    });

    this.medicalForm = this.fb.group({
      bloodType:      [''],
      allergies:      [''],
      medicalHistory: ['']
    });

    this.emergencyForm = this.fb.group({
      emergencyContactName:  [''],
      emergencyContactPhone: ['', [Validators.pattern(/^\+?[0-9]{10,20}$/)]]
    });

    if (!this.patientId) {
      this.error = 'Invalid patient ID';
      this.loading = false;
      return;
    }

    this.patientService.getPatientById(this.patientId).subscribe({
      next: (res) => {
        const p = res.data;
        this.personalForm.patchValue({
          firstName:   p.firstName,
          lastName:    p.lastName,
          email:       p.email,
          phoneNumber: p.phoneNumber,
          dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).substring(0, 10) : '',
          gender:      p.gender,
          address:     p.address   ?? '',
          city:        p.city      ?? '',
          state:       p.state     ?? '',
          zipCode:     p.zipCode   ?? '',
          country:     p.country   ?? ''
        });
        this.medicalForm.patchValue({
          bloodType:      p.bloodType      ?? '',
          allergies:      p.allergies      ?? '',
          medicalHistory: p.medicalHistory ?? ''
        });
        this.emergencyForm.patchValue({
          emergencyContactName:  p.emergencyContactName  ?? '',
          emergencyContactPhone: p.emergencyContactPhone ?? ''
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load patient data.';
        this.loading = false;
      }
    });
  }

  hasError(form: FormGroup, field: string, error: string) {
    const c = form.get(field);
    return c?.touched && c?.hasError(error);
  }

  async saveChanges() {
    this.personalForm.markAllAsTouched();
    if (this.personalForm.invalid) {
      this.showToast('Please fill in all required fields correctly.', 'warning');
      return;
    }

    this.emergencyForm.markAllAsTouched();
    if (this.emergencyForm.invalid) {
      this.showToast('Please check emergency contact phone number.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Saving changes…' });
    await loading.present();

    const raw = {
      ...this.personalForm.value,
      ...this.medicalForm.value,
      ...this.emergencyForm.value
    };
    const payload: PatientDto = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v === '' ? undefined : v])
    ) as unknown as PatientDto;

    this.patientService.updatePatient(this.patientId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        const t = await this.toastCtrl.create({
          message: 'Patient updated successfully.',
          duration: 2000, color: 'success', position: 'top'
        });
        await t.present();
        this.router.navigate(['/patients', this.patientId]);
      },
      error: async (err) => {
        await loading.dismiss();
        const msg = err?.error?.message ?? 'Failed to save changes. Please try again.';
        this.showToast(msg, 'danger');
      }
    });
  }

  private async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    await t.present();
  }
}
