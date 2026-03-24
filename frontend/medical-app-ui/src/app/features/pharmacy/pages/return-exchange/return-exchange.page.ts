import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox, IonSearchbar,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonIcon, IonSpinner, IonBackButton, IonBadge, IonSegment, IonSegmentButton,
  IonList, IonNote,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  swapHorizontalOutline, returnDownBackOutline, addOutline,
  trashOutline, removeOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import {
  PharmacyService, SaleDto, SaleItemDto,
  CreateReturnRequest, ExchangeItemRequest
} from '../../../../core/services/pharmacy.service';
import { InventoryService, MedicineDto } from '../../../../core/services/inventory.service';

interface ReturnItemUI {
  saleItem: SaleItemDto;
  selected: boolean;
  quantity: number;
}

interface ExchangeItemUI {
  medicine: MedicineDto;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-return-exchange',
  templateUrl: 'return-exchange.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, IonTextarea, IonCheckbox, IonSearchbar,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonIcon, IonSpinner, IonBackButton, IonBadge, IonSegment, IonSegmentButton,
    IonList, IonNote
  ]
})
export class ReturnExchangePage implements OnInit {
  // Step 1: find sale
  saleSearchTerm = '';
  searchResults: SaleDto[] = [];
  searchLoading = false;

  // Step 2: return items
  sale: SaleDto | null = null;
  returnItems: ReturnItemUI[] = [];
  returnReason = '';

  // Transaction type
  transactionType: 'RETURN' | 'EXCHANGE' = 'RETURN';

  // Step 3: exchange items (only for EXCHANGE)
  medicineSearchTerm = '';
  medicineResults: MedicineDto[] = [];
  medicineSearchLoading = false;
  exchangeCart: ExchangeItemUI[] = [];

  loading = false;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pharmacyService: PharmacyService,
    private inventoryService: InventoryService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      swapHorizontalOutline, returnDownBackOutline, addOutline,
      trashOutline, removeOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    const saleId = this.route.snapshot.queryParamMap.get('saleId');
    if (saleId) {
      this.loadSaleById(+saleId);
    }
  }

  loadSaleById(id: number) {
    this.loading = true;
    this.pharmacyService.getSaleById(id).subscribe({
      next: res => {
        this.selectSale(res.data);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  searchSales() {
    if (!this.saleSearchTerm.trim()) { this.searchResults = []; return; }
    this.searchLoading = true;
    this.pharmacyService.getSales(0, 10, undefined, undefined, undefined, this.saleSearchTerm).subscribe({
      next: res => {
        this.searchResults = (res.data?.content ?? [])
          .filter(s => s.status === 'COMPLETED' || s.status === 'PARTIALLY_RETURNED');
        this.searchLoading = false;
      },
      error: () => { this.searchLoading = false; }
    });
  }

  selectSale(sale: SaleDto) {
    this.sale = sale;
    this.searchResults = [];
    this.saleSearchTerm = '';
    this.returnItems = (sale.items ?? []).map(item => ({
      saleItem: item,
      selected: false,
      quantity: 1
    }));
    this.exchangeCart = [];
  }

  clearSale() {
    this.sale = null;
    this.returnItems = [];
    this.exchangeCart = [];
  }

  // Return items
  get selectedReturnItems() {
    return this.returnItems.filter(r => r.selected && r.quantity > 0);
  }

  get totalRefund(): number {
    return this.selectedReturnItems.reduce((s, r) => s + r.saleItem.unitPrice * r.quantity, 0);
  }

  get hasSelectedItems(): boolean {
    return this.selectedReturnItems.length > 0;
  }

  // Exchange items
  searchMedicines(event: any) {
    const term = event?.detail?.value ?? '';
    if (!term.trim()) { this.medicineResults = []; return; }
    this.medicineSearchLoading = true;
    this.inventoryService.getMedicines(term, undefined, 0, 10).subscribe({
      next: res => {
        this.medicineResults = res.data?.content ?? [];
        this.medicineSearchLoading = false;
      },
      error: () => { this.medicineSearchLoading = false; }
    });
  }

  addToExchangeCart(med: MedicineDto) {
    const existing = this.exchangeCart.find(e => e.medicine.id === med.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.exchangeCart.push({ medicine: med, quantity: 1, unitPrice: med.unitPrice ?? 0 });
    }
    this.medicineResults = [];
    this.medicineSearchTerm = '';
  }

  removeFromExchangeCart(index: number) {
    this.exchangeCart.splice(index, 1);
  }

  get exchangeTotal(): number {
    return this.exchangeCart.reduce((s, e) => s + e.unitPrice * e.quantity, 0);
  }

  get netSettlement(): number {
    return this.totalRefund - this.exchangeTotal;
  }

  get canSubmit(): boolean {
    if (!this.sale || !this.hasSelectedItems) return false;
    if (this.transactionType === 'EXCHANGE' && this.exchangeCart.length === 0) return false;
    return !this.submitting;
  }

  async submit() {
    if (!this.sale || !this.canSubmit) return;

    const loading = await this.loadingCtrl.create({
      message: this.transactionType === 'EXCHANGE' ? 'Processing exchange...' : 'Processing return...'
    });
    await loading.present();
    this.submitting = true;

    const processedBy = localStorage.getItem('username') ?? 'unknown';

    const exchangeItems: ExchangeItemRequest[] = this.exchangeCart.map(e => ({
      medicineId: e.medicine.id,
      medicineName: e.medicine.name,
      medicineUnit: e.medicine.unit,
      quantity: e.quantity,
      unitPrice: e.unitPrice
    }));

    const req: CreateReturnRequest = {
      originalSaleId: this.sale.id,
      returnReason: this.returnReason || undefined,
      processedBy,
      transactionType: this.transactionType,
      items: this.selectedReturnItems.map(r => ({
        originalSaleItemId: r.saleItem.id,
        medicineId: r.saleItem.medicineId,
        medicineName: r.saleItem.medicineName,
        quantityReturned: r.quantity,
        unitPrice: r.saleItem.unitPrice
      })),
      exchangeItems: this.transactionType === 'EXCHANGE' ? exchangeItems : []
    };

    this.pharmacyService.createReturn(req).subscribe({
      next: async res => {
        await loading.dismiss();
        this.submitting = false;
        const d = res.data;
        const net = d.netSettlement ?? 0;
        const msg = this.transactionType === 'EXCHANGE'
          ? `Exchange ${d.returnNumber} done. Net: ${net >= 0 ? '₹' + net + ' refund' : '₹' + Math.abs(net) + ' charged'}`
          : `Return ${d.returnNumber} processed. Refund: ₹${d.totalRefundAmount}`;
        const toast = await this.toastCtrl.create({ message: msg, duration: 3500, color: 'success' });
        await toast.present();
        this.router.navigate(['/pharmacy/returns']);
      },
      error: async () => { await loading.dismiss(); this.submitting = false; }
    });
  }
}
