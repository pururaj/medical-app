import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonSpinner, IonBackButton, IonNote,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { InventoryService } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-medicine-form',
  templateUrl: 'medicine-form.page.html',
  styleUrls: ['medicine-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
    IonSpinner, IonBackButton, IonNote
  ]
})
export class MedicineFormPage implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  medicineId: number | null = null;
  pageTitle = 'Add Medicine';
  submitting = false;

  readonly categories = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS', 'OTHER'];
  readonly units = ['TABLET', 'ML', 'MG', 'UNIT'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ saveOutline, closeOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;
    this.medicineId = id ? +id : null;
    this.pageTitle = this.isEditMode ? 'Edit Medicine' : 'Add Medicine';
    this.buildForm();
    if (this.isEditMode && this.medicineId) {
      this.loadMedicine(this.medicineId);
    }
  }

  private buildForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      genericName: [''],
      category: ['', Validators.required],
      manufacturer: [''],
      description: [''],
      unit: ['', Validators.required],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
      reorderLevel: [10, [Validators.required, Validators.min(0)]]
    });
  }

  private loadMedicine(id: number) {
    this.inventoryService.getMedicineById(id).subscribe({
      next: res => {
        const m = res.data;
        this.form.patchValue({
          name: m.name,
          genericName: m.genericName ?? '',
          category: m.category,
          manufacturer: m.manufacturer ?? '',
          description: m.description ?? '',
          unit: m.unit,
          unitPrice: m.unitPrice,
          reorderLevel: m.reorderLevel
        });
      },
      error: () => this.router.navigate(['/inventory'])
    });
  }

  onSelectChange(field: string, event: Event) {
    const value = (event as CustomEvent).detail.value;
    this.form.get(field)?.setValue(value);
    this.form.get(field)?.markAsTouched();
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const fields: Record<string, string> = { name: 'Name', category: 'Category', unit: 'Unit', unitPrice: 'Unit Price', reorderLevel: 'Reorder Level' };
      const firstInvalid = Object.entries(fields).find(([k]) => this.form.get(k)?.invalid)?.[1] ?? 'fields';
      const toast = await this.toastCtrl.create({ message: `"${firstInvalid}" is required.`, duration: 2000, color: 'warning' });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: this.isEditMode ? 'Saving changes...' : 'Adding medicine...' });
    await loading.present();
    this.submitting = true;

    const raw = this.form.value;
    const request$ = this.isEditMode && this.medicineId
      ? this.inventoryService.updateMedicine(this.medicineId, raw)
      : this.inventoryService.createMedicine(raw);

    request$.subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.submitting = false;
        const toast = await this.toastCtrl.create({
          message: this.isEditMode ? 'Medicine updated!' : 'Medicine added!',
          duration: 2000, color: 'success'
        });
        await toast.present();
        this.router.navigate(['/inventory/medicines', res.data.id]);
      },
      error: async () => {
        await loading.dismiss();
        this.submitting = false;
      }
    });
  }

  cancel() {
    if (this.isEditMode && this.medicineId) {
      this.router.navigate(['/inventory/medicines', this.medicineId]);
    } else {
      this.router.navigate(['/inventory']);
    }
  }
}
