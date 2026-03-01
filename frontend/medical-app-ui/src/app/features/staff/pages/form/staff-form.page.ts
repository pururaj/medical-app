import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonDatetime, IonModal,
  IonSpinner, IonNote, IonText, IonDatetimeButton,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, lockClosedOutline, briefcaseOutline,
  timeOutline, checkmarkDoneOutline, shieldCheckmarkOutline, calendarOutline
} from 'ionicons/icons';

import { StaffService, CreateStaffRequest, UpdateStaffRequest } from '../../../../core/services/staff.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-staff-form',
  templateUrl: 'staff-form.page.html',
  styleUrls: ['staff-form.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonDatetime, IonModal,
    IonSpinner, IonNote, IonText, IonDatetimeButton
  ]
})
export class StaffFormPage implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  staffId?: number;
  loading = false;
  submitting = false;

  readonly roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'NURSE', label: 'Nurse' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LAB_TECH', label: 'Lab Technician' },
  ];

  readonly shifts = [
    { value: 'MORNING', label: 'Morning' },
    { value: 'AFTERNOON', label: 'Afternoon' },
    { value: 'NIGHT', label: 'Night' },
    { value: 'ROTATIONAL', label: 'Rotational' },
  ];

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    private toastService: ToastService,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({
      personOutline, mailOutline, lockClosedOutline, briefcaseOutline,
      timeOutline, checkmarkDoneOutline, shieldCheckmarkOutline, calendarOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;
    if (id) this.staffId = Number(id);

    this.buildForm();

    if (this.isEditMode && this.staffId) {
      this.loadStaff(this.staffId);
    }
  }

  private buildForm() {
    this.form = this.fb.group({
      // Create-only fields
      username: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(3), Validators.maxLength(50)]
      ],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]
      ],
      role: [
        '',
        this.isEditMode ? [] : [Validators.required]
      ],
      // Common fields
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      department: [''],
      shift: ['MORNING'],
      qualification: [''],
      licenseNumber: [''],
      joiningDate: [''],
    });
  }

  private loadStaff(id: number) {
    this.loading = true;
    this.staffService.getStaffById(id).subscribe({
      next: (res) => {
        const s = res.data;
        this.form.patchValue({
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phoneNumber: s.phoneNumber ?? '',
          department: s.department ?? '',
          shift: s.shift ?? 'MORNING',
          qualification: s.qualification ?? '',
          licenseNumber: s.licenseNumber ?? '',
          joiningDate: s.joiningDate ?? '',
        });
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Failed to load staff details.');
        this.loading = false;
        this.router.navigate(['/staff']);
      }
    });
  }

  // IonSelect doesn't reliably fire Angular's ControlValueAccessor in Ionic 8.0.x.
  // Manually patch the form control on ionChange to guarantee the value is registered.
  onSelectChange(field: string, event: Event) {
    const value = (event as CustomEvent).detail.value;
    this.form.get(field)?.setValue(value);
    this.form.get(field)?.markAsTouched();
  }

  hasError(field: string, error: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.hasError(error));
  }

  // Returns the label of the first invalid required field, for a clear toast message.
  private firstInvalidFieldLabel(): string {
    const labels: Record<string, string> = {
      username: 'Username', password: 'Password', role: 'Role',
      firstName: 'First Name', lastName: 'Last Name', email: 'Email'
    };
    for (const [field, label] of Object.entries(labels)) {
      const ctrl = this.form.get(field);
      if (ctrl?.invalid) return label;
    }
    return 'one or more fields';
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toastService.showWarning(`"${this.firstInvalidFieldLabel()}" is required.`);
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Saving changes...' : 'Creating staff member...'
    });
    await loading.present();

    const val = this.form.value;

    if (this.isEditMode && this.staffId) {
      const payload: UpdateStaffRequest = {
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        phoneNumber: val.phoneNumber || undefined,
        department: val.department || undefined,
        shift: val.shift || undefined,
        qualification: val.qualification || undefined,
        licenseNumber: val.licenseNumber || undefined,
        joiningDate: val.joiningDate || undefined,
        password: val.password || undefined,
      };

      this.staffService.updateStaff(this.staffId, payload).subscribe({
        next: async () => {
          await loading.dismiss();
          await this.toastService.showSuccess('Staff member updated successfully.');
          this.router.navigate(['/staff', this.staffId]);
        },
        error: async () => {
          await loading.dismiss(); // error toast already shown by errorInterceptor
        }
      });
    } else {
      const payload: CreateStaffRequest = {
        username: val.username,
        password: val.password,
        role: val.role,
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        phoneNumber: val.phoneNumber || undefined,
        department: val.department || undefined,
        shift: val.shift || undefined,
        qualification: val.qualification || undefined,
        licenseNumber: val.licenseNumber || undefined,
        joiningDate: val.joiningDate || undefined,
      };

      this.staffService.createStaff(payload).subscribe({
        next: async (res) => {
          await loading.dismiss();
          await this.toastService.showSuccess('Staff member created successfully.');
          this.router.navigate(['/staff', res.data.id]);
        },
        error: async () => {
          await loading.dismiss(); // error toast already shown by errorInterceptor
        }
      });
    }
  }
}
