import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonSpinner, IonIcon, IonItem, IonLabel, IonInput, IonSegment,
  IonSegmentButton, IonChip,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barcodeOutline, cameraOutline, searchOutline, scanOutline } from 'ionicons/icons';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { InventoryService, ScannedMedicineDto } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-medicine-scan',
  templateUrl: 'medicine-scan.page.html',
  styleUrls: ['medicine-scan.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, ZXingScannerModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonSpinner, IonIcon, IonItem, IonLabel, IonInput, IonSegment,
    IonSegmentButton, IonChip
  ]
})
export class MedicineScanPage implements OnDestroy {
  activeTab: 'barcode' | 'label' = 'barcode';
  manualBarcode = '';
  scannerEnabled = true;
  scanning = false;
  foundMedicine: ScannedMedicineDto | null = null;
  notFoundBarcode: string | null = null;

  selectedLabelFile: File | null = null;
  labelPreviewUrl: string | null = null;
  processingLabel = false;

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ barcodeOutline, cameraOutline, searchOutline, scanOutline });
  }

  ngOnDestroy() {
    this.scannerEnabled = false;
  }

  onSegmentChange(event: Event) {
    this.activeTab = (event as CustomEvent).detail.value;
    this.scannerEnabled = this.activeTab === 'barcode';
    this.resetBarcode();
  }

  onBarcodeScanned(result: string) {
    if (this.scanning) return;
    this.scannerEnabled = false;
    this.lookupBarcode(result);
  }

  lookupManual() {
    if (!this.manualBarcode.trim()) return;
    this.lookupBarcode(this.manualBarcode.trim());
  }

  private lookupBarcode(barcode: string) {
    this.scanning = true;
    this.foundMedicine = null;
    this.notFoundBarcode = null;

    this.inventoryService.scanBarcode(barcode).subscribe({
      next: (res) => {
        this.scanning = false;
        const dto = res.data;
        if (dto?.name) {
          this.foundMedicine = dto;
        } else {
          this.notFoundBarcode = barcode;
        }
      },
      error: () => {
        this.scanning = false;
        this.notFoundBarcode = barcode;
      }
    });
  }

  addNotFound() {
    if (!this.notFoundBarcode) return;
    this.router.navigate(['/inventory/medicines/new'], { queryParams: { barcode: this.notFoundBarcode } });
  }

  resetBarcode() {
    this.foundMedicine = null;
    this.notFoundBarcode = null;
    this.manualBarcode = '';
    this.scanning = false;
    this.scannerEnabled = this.activeTab === 'barcode';
  }

  onLabelFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLabelFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.labelPreviewUrl = e.target?.result as string; };
      reader.readAsDataURL(this.selectedLabelFile);
    }
  }

  async processLabel() {
    if (!this.selectedLabelFile) return;
    const loading = await this.loadingCtrl.create({ message: 'Reading label with AI...' });
    await loading.present();
    this.processingLabel = true;

    this.inventoryService.scanLabel(this.selectedLabelFile).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.processingLabel = false;
        const dto = res.data;
        const params: any = {};
        if (dto?.name) params['name'] = dto.name;
        if (dto?.genericName) params['genericName'] = dto.genericName;
        if (dto?.manufacturer) params['manufacturer'] = dto.manufacturer;
        if (dto?.category) params['category'] = dto.category;
        if (dto?.unit) params['unit'] = dto.unit;
        if (dto?.barcode) params['barcode'] = dto.barcode;
        this.router.navigate(['/inventory/medicines/new'], { queryParams: params });
      },
      error: async () => {
        await loading.dismiss();
        this.processingLabel = false;
        const toast = await this.toastCtrl.create({ message: 'Failed to read label. Please try again.', duration: 3000, color: 'danger' });
        await toast.present();
      }
    });
  }
}
