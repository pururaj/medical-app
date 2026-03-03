import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonSearchbar, IonCard, IonCardContent, IonChip, IonLabel,
  IonSpinner, IonText, IonSelect, IonSelectOption, IonRefresher,
  IonRefresherContent, IonIcon, IonBadge, IonItemSliding,
  IonItem, IonItemOptions, IonItemOption, IonFab, IonFabButton,
  AlertController, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, trashOutline, pencilOutline, medkitOutline,
  alertCircleOutline, cubeOutline, filterOutline, searchOutline,
  layersOutline, warningOutline
} from 'ionicons/icons';
import { InventoryService, MedicineDto, InventorySummaryDto } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-medicine-list',
  templateUrl: 'medicine-list.page.html',
  styleUrls: ['medicine-list.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonSearchbar, IonCard, IonCardContent, IonChip, IonLabel,
    IonSpinner, IonText, IonSelect, IonSelectOption, IonRefresher,
    IonRefresherContent, IonIcon, IonBadge, IonItemSliding,
    IonItem, IonItemOptions, IonItemOption, IonFab, IonFabButton
  ]
})
export class MedicineListPage implements OnInit {
  medicines: MedicineDto[] = [];
  summary: InventorySummaryDto | null = null;
  loading = false;
  searchTerm = '';
  selectedCategory = '';

  readonly categories = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS', 'OTHER'];

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ addOutline, trashOutline, pencilOutline, medkitOutline, alertCircleOutline, cubeOutline, filterOutline, searchOutline, layersOutline, warningOutline });
  }

  editMedicine(medicine: MedicineDto, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/inventory/medicines', medicine.id, 'edit']);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(event?: any) {
    this.loading = true;
    this.inventoryService.getSummary().subscribe({
      next: res => { this.summary = res.data; },
      error: () => {}
    });
    this.inventoryService.getMedicines(this.searchTerm || undefined, this.selectedCategory || undefined).subscribe({
      next: res => {
        this.medicines = res.data?.content ?? [];
        this.loading = false;
        event?.target?.complete();
      },
      error: () => {
        this.loading = false;
        event?.target?.complete();
      }
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.detail.value ?? '';
    this.loadData();
  }

  onCategoryChange(event: Event) {
    this.selectedCategory = (event as CustomEvent).detail.value ?? '';
    this.loadData();
  }

  viewMedicine(medicine: MedicineDto) {
    this.router.navigate(['/inventory/medicines', medicine.id]);
  }

  addMedicine() {
    this.router.navigate(['/inventory/medicines/new']);
  }

  manageStock() {
    this.router.navigate(['/inventory/stock']);
  }

  async confirmDelete(medicine: MedicineDto, slidingItem: IonItemSliding) {
    await slidingItem.close();
    const alert = await this.alertCtrl.create({
      header: 'Deactivate Medicine',
      message: `Are you sure you want to deactivate "${medicine.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Deactivate',
          role: 'destructive',
          handler: () => this.deleteMedicine(medicine)
        }
      ]
    });
    await alert.present();
  }

  private async deleteMedicine(medicine: MedicineDto) {
    const loading = await this.loadingCtrl.create({ message: 'Deactivating...' });
    await loading.present();
    this.inventoryService.deleteMedicine(medicine.id).subscribe({
      next: async () => {
        await loading.dismiss();
        this.medicines = this.medicines.filter(m => m.id !== medicine.id);
        if (this.summary) this.summary.totalMedicines--;
        const toast = await this.toastCtrl.create({ message: 'Medicine deactivated', duration: 2000, color: 'success' });
        await toast.present();
      },
      error: async () => { await loading.dismiss(); }
    });
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      TABLET: 'primary', CAPSULE: 'secondary', SYRUP: 'tertiary',
      INJECTION: 'danger', CREAM: 'warning', DROPS: 'success', OTHER: 'medium'
    };
    return colors[category] ?? 'medium';
  }

  getStockStatus(medicine: MedicineDto): { label: string; color: string } {
    if (medicine.totalStock === 0) return { label: 'Out of Stock', color: 'danger' };
    if (medicine.totalStock < medicine.reorderLevel) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  }
}
