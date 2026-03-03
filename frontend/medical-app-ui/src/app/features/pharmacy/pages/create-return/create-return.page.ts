import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox,
  IonCard, IonCardContent, IonIcon, IonSpinner, IonBackButton,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { returnDownBackOutline } from 'ionicons/icons';
import { PharmacyService, SaleDto, SaleItemDto, CreateReturnRequest } from '../../../../core/services/pharmacy.service';

interface ReturnItemUI {
  saleItem: SaleItemDto;
  selected: boolean;
  quantity: number;
}

@Component({
  selector: 'app-create-return',
  templateUrl: 'create-return.page.html',
  styleUrls: ['create-return.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox,
    IonCard, IonCardContent, IonIcon, IonSpinner, IonBackButton
  ]
})
export class CreateReturnPage implements OnInit {
  sale: SaleDto | null = null;
  returnItems: ReturnItemUI[] = [];
  returnReason = '';
  loading = true;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pharmacyService: PharmacyService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ returnDownBackOutline });
  }

  ngOnInit() {
    const saleId = this.route.snapshot.queryParamMap.get('saleId');
    if (!saleId) { this.loading = false; return; }

    this.pharmacyService.getSaleById(+saleId).subscribe({
      next: res => {
        this.sale = res.data;
        this.returnItems = (res.data.items ?? []).map(item => ({
          saleItem: item,
          selected: false,
          quantity: 1
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get totalRefund(): number {
    return this.returnItems
      .filter(r => r.selected)
      .reduce((sum, r) => sum + r.saleItem.unitPrice * r.quantity, 0);
  }

  get hasSelectedItems(): boolean {
    return this.returnItems.some(r => r.selected && r.quantity > 0);
  }

  async submitReturn() {
    if (!this.sale || !this.hasSelectedItems) return;

    const loading = await this.loadingCtrl.create({ message: 'Processing return...' });
    await loading.present();
    this.submitting = true;

    const processedBy = localStorage.getItem('username') ?? 'unknown';

    const req: CreateReturnRequest = {
      originalSaleId: this.sale.id,
      returnReason: this.returnReason || undefined,
      processedBy,
      items: this.returnItems
        .filter(r => r.selected && r.quantity > 0)
        .map(r => ({
          originalSaleItemId: r.saleItem.id,
          medicineId: r.saleItem.medicineId,
          medicineName: r.saleItem.medicineName,
          quantityReturned: r.quantity,
          unitPrice: r.saleItem.unitPrice
        }))
    };

    this.pharmacyService.createReturn(req).subscribe({
      next: async res => {
        await loading.dismiss();
        this.submitting = false;
        const toast = await this.toastCtrl.create({
          message: `Return ${res.data?.returnNumber} processed. Refund: ₹${res.data?.totalRefundAmount}`,
          duration: 3000, color: 'success'
        });
        await toast.present();
        this.router.navigate(['/pharmacy/returns']);
      },
      error: async () => { await loading.dismiss(); this.submitting = false; }
    });
  }
}
