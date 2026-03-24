import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonSpinner, IonIcon, IonItem, IonLabel, IonInput, IonCheckbox,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, checkmarkCircleOutline, trashOutline } from 'ionicons/icons';
import { InventoryService, ScannedMedicineDto, BulkCreateRequest } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-bill-scan',
  templateUrl: 'bill-scan.page.html',
  styleUrls: ['bill-scan.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonSpinner, IonIcon, IonItem, IonLabel, IonInput, IonCheckbox
  ]
})
export class BillScanPage {
  step: 'upload' | 'processing' | 'review' = 'upload';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  scannedMedicines: (ScannedMedicineDto & { include: boolean })[] = [];

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ cloudUploadOutline, checkmarkCircleOutline, trashOutline });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async processBill() {
    if (!this.selectedFile) return;
    this.step = 'processing';
    const loading = await this.loadingCtrl.create({ message: 'Analysing bill with AI...' });
    await loading.present();

    this.inventoryService.scanBill(this.selectedFile).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.scannedMedicines = (res.data?.medicines ?? []).map(m => ({ ...m, include: true }));
        this.step = 'review';
      },
      error: async () => {
        await loading.dismiss();
        this.step = 'upload';
        const toast = await this.toastCtrl.create({ message: 'Failed to analyse bill. Please try again.', duration: 3000, color: 'danger' });
        await toast.present();
      }
    });
  }

  removeItem(index: number) {
    this.scannedMedicines.splice(index, 1);
  }

  get selectedCount(): number {
    return this.scannedMedicines.filter(m => m.include).length;
  }

  async confirmAndSave() {
    const selected = this.scannedMedicines.filter(m => m.include);
    if (selected.length === 0) return;

    const loading = await this.loadingCtrl.create({ message: 'Saving medicines...' });
    await loading.present();

    const req: BulkCreateRequest = {
      medicines: selected.map(({ include, ...m }) => m),
      performedBy: 'system'
    };

    this.inventoryService.bulkCreate(req).subscribe({
      next: async (res) => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: `${res.data?.length ?? selected.length} medicines saved successfully!`,
          duration: 2500, color: 'success'
        });
        await toast.present();
        this.router.navigate(['/inventory']);
      },
      error: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'Failed to save medicines.', duration: 3000, color: 'danger' });
        await toast.present();
      }
    });
  }

  reset() {
    this.step = 'upload';
    this.selectedFile = null;
    this.previewUrl = null;
    this.scannedMedicines = [];
  }
}
