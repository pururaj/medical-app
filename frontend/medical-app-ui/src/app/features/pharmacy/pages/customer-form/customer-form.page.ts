import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonInput, IonNote, IonSpinner, IonBackButton,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline } from 'ionicons/icons';
import { PharmacyService } from '../../../../core/services/pharmacy.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: 'customer-form.page.html',
  styleUrls: ['customer-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, IonNote, IonSpinner, IonBackButton
  ]
})
export class CustomerFormPage implements OnInit {
  form!: FormGroup;
  isEdit = false;
  customerId: number | null = null;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pharmacyService: PharmacyService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ personOutline });
  }

  ngOnInit() {
    this.form = this.fb.group({
      name:      ['', Validators.required],
      phone:     ['', Validators.required],
      email:     [''],
      address:   [''],
      patientId: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.customerId = +idParam;
      this.pharmacyService.getCustomerById(this.customerId).subscribe({
        next: res => {
          const c = res.data;
          this.form.patchValue({ name: c.name, phone: c.phone, email: c.email, address: c.address, patientId: c.patientId });
        }
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const loading = await this.loadingCtrl.create({ message: 'Saving...' });
    await loading.present();
    this.submitting = true;

    const val = this.form.value;
    const req = { ...val, patientId: val.patientId ? +val.patientId : undefined };

    const obs = this.isEdit
      ? this.pharmacyService.updateCustomer(this.customerId!, req)
      : this.pharmacyService.createCustomer(req);

    obs.subscribe({
      next: async () => {
        await loading.dismiss();
        this.submitting = false;
        const toast = await this.toastCtrl.create({
          message: this.isEdit ? 'Customer updated!' : 'Customer added!',
          duration: 2000, color: 'success'
        });
        await toast.present();
        this.router.navigate(['/pharmacy/customers']);
      },
      error: async () => { await loading.dismiss(); this.submitting = false; }
    });
  }
}
