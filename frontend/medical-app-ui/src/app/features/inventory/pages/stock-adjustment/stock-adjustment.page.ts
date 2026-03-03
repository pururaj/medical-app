import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonSpinner, IonBackButton, IonNote, IonCard, IonCardContent, IonChip,
  IonSearchbar, IonIcon, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, cubeOutline } from 'ionicons/icons';
import { InventoryService, MedicineDto } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-stock-adjustment',
  templateUrl: 'stock-adjustment.page.html',
  styleUrls: ['stock-adjustment.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
    IonSpinner, IonBackButton, IonNote, IonCard, IonCardContent, IonChip,
    IonSearchbar, IonIcon
  ]
})
export class StockAdjustmentPage implements OnInit {
  form!: FormGroup;
  allMedicines: MedicineDto[] = [];
  filteredMedicines: MedicineDto[] = [];
  selectedMedicine: MedicineDto | null = null;
  showMedicineSearch = false;
  searchTerm = '';
  currentStock = 0;
  submitting = false;

  readonly transactionTypes = [
    { value: 'PURCHASE', label: 'Purchase (Add Stock)' },
    { value: 'DISPENSED', label: 'Dispensed (Remove Stock)' },
    { value: 'ADJUSTMENT', label: 'Manual Adjustment (Remove)' },
    { value: 'RETURNED', label: 'Returned (Add Stock)' },
    { value: 'EXPIRED', label: 'Expired (Remove Stock)' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ searchOutline, cubeOutline });
  }

  ngOnInit() {
    this.buildForm();
    this.loadMedicines();

    // Pre-fill if ?medicineId= is passed
    const medicineId = this.route.snapshot.queryParamMap.get('medicineId');
    if (medicineId) {
      this.inventoryService.getMedicineById(+medicineId).subscribe({
        next: res => this.selectMedicine(res.data)
      });
    }
  }

  private buildForm() {
    this.form = this.fb.group({
      medicineId: [null, Validators.required],
      transactionType: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      notes: [''],
      batchNumber: [''],
      supplier: [''],
      location: [''],
      expiryDate: ['']
    });
  }

  private loadMedicines() {
    this.inventoryService.getMedicines(undefined, undefined, 0, 200).subscribe({
      next: res => {
        this.allMedicines = res.data?.content ?? [];
        this.filteredMedicines = this.allMedicines;
      }
    });
  }

  onMedicineSearch(event: any) {
    const term = event.detail.value?.toLowerCase() ?? '';
    this.filteredMedicines = this.allMedicines.filter(m =>
      m.name.toLowerCase().includes(term) || (m.genericName?.toLowerCase().includes(term))
    );
  }

  selectMedicine(medicine: MedicineDto) {
    this.selectedMedicine = medicine;
    this.showMedicineSearch = false;
    this.form.patchValue({ medicineId: medicine.id });

    this.inventoryService.getStockForMedicine(medicine.id).subscribe({
      next: res => {
        this.currentStock = (res.data ?? []).reduce((sum, s) => sum + s.currentQuantity, 0);
      }
    });
  }

  onTypeChange(event: Event) {
    const value = (event as CustomEvent).detail.value;
    this.form.get('transactionType')?.setValue(value);
    this.form.get('transactionType')?.markAsTouched();
  }

  isAddType(): boolean {
    const t = this.form.get('transactionType')?.value;
    return t === 'PURCHASE' || t === 'RETURNED';
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const toast = await this.toastCtrl.create({ message: 'Please fill all required fields', duration: 2000, color: 'warning' });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Adjusting stock...' });
    await loading.present();
    this.submitting = true;

    const val = this.form.value;
    const performedBy = localStorage.getItem('username') ?? 'unknown';

    this.inventoryService.adjustStock({ ...val, performedBy }).subscribe({
      next: async () => {
        await loading.dismiss();
        this.submitting = false;
        const toast = await this.toastCtrl.create({ message: 'Stock adjusted successfully!', duration: 2000, color: 'success' });
        await toast.present();
        if (this.selectedMedicine) {
          this.router.navigate(['/inventory/medicines', this.selectedMedicine.id]);
        } else {
          this.router.navigate(['/inventory/stock']);
        }
      },
      error: async () => {
        await loading.dismiss();
        this.submitting = false;
      }
    });
  }
}
