import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonChip, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonSpinner, IonIcon, IonBadge, IonBackButton, IonList,
  AlertController, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  pencilOutline, trashOutline, cubeOutline, addCircleOutline,
  timeOutline, arrowUpOutline, arrowDownOutline, swapHorizontalOutline,
  returnUpForwardOutline, warningOutline
} from 'ionicons/icons';
import {
  InventoryService, MedicineDto, InventoryStockDto, StockTransactionDto
} from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-medicine-detail',
  templateUrl: 'medicine-detail.page.html',
  styleUrls: ['medicine-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonChip, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonSpinner, IonIcon, IonBadge, IonBackButton, IonList
  ]
})
export class MedicineDetailPage implements OnInit {
  medicine: MedicineDto | null = null;
  stocks: InventoryStockDto[] = [];
  transactions: StockTransactionDto[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ pencilOutline, trashOutline, cubeOutline, addCircleOutline, timeOutline, arrowUpOutline, arrowDownOutline, swapHorizontalOutline, returnUpForwardOutline, warningOutline });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll(id);
  }

  private loadAll(id: number) {
    this.loading = true;
    this.inventoryService.getMedicineById(id).subscribe({
      next: res => {
        this.medicine = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; this.router.navigate(['/inventory']); }
    });
    this.inventoryService.getStockForMedicine(id).subscribe({
      next: res => { this.stocks = res.data ?? []; }
    });
    this.inventoryService.getTransactions(id).subscribe({
      next: res => { this.transactions = (res.data ?? []).slice(0, 10); }
    });
  }

  editMedicine() {
    this.router.navigate(['/inventory/medicines', this.medicine?.id, 'edit']);
  }

  adjustStock() {
    this.router.navigate(['/inventory/stock/adjust'], { queryParams: { medicineId: this.medicine?.id } });
  }

  async confirmDelete() {
    const alert = await this.alertCtrl.create({
      header: 'Deactivate Medicine',
      message: `Deactivate "${this.medicine?.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Deactivate', role: 'destructive', handler: () => this.deleteMedicine() }
      ]
    });
    await alert.present();
  }

  private async deleteMedicine() {
    if (!this.medicine) return;
    const loading = await this.loadingCtrl.create({ message: 'Deactivating...' });
    await loading.present();
    this.inventoryService.deleteMedicine(this.medicine.id).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'Medicine deactivated', duration: 2000, color: 'success' });
        await toast.present();
        this.router.navigate(['/inventory']);
      },
      error: async () => { await loading.dismiss(); }
    });
  }

  get totalStock(): number {
    return this.stocks.reduce((sum, s) => sum + s.currentQuantity, 0);
  }

  getStockStatus(): { label: string; color: string } {
    if (!this.medicine) return { label: 'Unknown', color: 'medium' };
    const total = this.totalStock;
    if (total === 0) return { label: 'Out of Stock', color: 'danger' };
    if (total < this.medicine.reorderLevel) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      TABLET: 'primary', CAPSULE: 'secondary', SYRUP: 'tertiary',
      INJECTION: 'danger', CREAM: 'warning', DROPS: 'success', OTHER: 'medium'
    };
    return colors[cat] ?? 'medium';
  }

  getTransactionIcon(type: string): string {
    const icons: Record<string, string> = {
      PURCHASE: 'arrow-up-outline', DISPENSED: 'arrow-down-outline',
      ADJUSTMENT: 'swap-horizontal-outline', RETURNED: 'return-up-forward-outline',
      EXPIRED: 'warning-outline'
    };
    return icons[type] ?? 'time-outline';
  }

  getTransactionColor(type: string): string {
    const colors: Record<string, string> = {
      PURCHASE: 'success', DISPENSED: 'primary', ADJUSTMENT: 'warning',
      RETURNED: 'secondary', EXPIRED: 'danger'
    };
    return colors[type] ?? 'medium';
  }

  isExpiringSoon(dateStr?: string): boolean {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return expiry <= thirtyDays;
  }
}
