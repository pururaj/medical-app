import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonIcon, IonChip, IonSearchbar, IonSegment, IonSegmentButton,
  IonList, IonText, IonNote, IonSpinner,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, removeOutline, trashOutline, cartOutline,
  personOutline, searchOutline, checkmarkCircleOutline, receiptOutline
} from 'ionicons/icons';
import { InventoryService, MedicineDto } from '../../../../core/services/inventory.service';
import { PharmacyService, CartItem, CreateSaleRequest } from '../../../../core/services/pharmacy.service';

@Component({
  selector: 'app-pos-sales',
  templateUrl: 'pos-sales.page.html',
  styleUrls: ['pos-sales.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonIcon, IonChip, IonSearchbar, IonSegment, IonSegmentButton,
    IonList, IonText, IonNote, IonSpinner
  ]
})
export class POSSalesPage implements OnInit {
  // Medicine search
  medicineSearchTerm = '';
  medicines: MedicineDto[] = [];
  loadingMedicines = false;

  // Cart
  cartItems: CartItem[] = [];

  // Customer
  customerMode = 'walkin'; // 'walkin' | 'existing'
  walkinName = '';
  walkinPhone = '';
  customerSearchTerm = '';
  customerResults: any[] = [];
  selectedCustomer: any = null;

  // Sale
  discountAmount = 0;
  paymentMethod = 'CASH';
  notes = '';
  submitting = false;

  readonly paymentMethods = ['CASH', 'CARD', 'UPI', 'INSURANCE'];

  constructor(
    private inventoryService: InventoryService,
    private pharmacyService: PharmacyService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({ addOutline, removeOutline, trashOutline, cartOutline, personOutline, searchOutline, checkmarkCircleOutline, receiptOutline });
  }

  ngOnInit() {
    this.searchMedicines('');
  }

  searchMedicines(term: string) {
    this.loadingMedicines = true;
    this.inventoryService.getMedicines(term || undefined, undefined, 0, 30).subscribe({
      next: res => {
        this.medicines = res.data?.content ?? [];
        this.loadingMedicines = false;
      },
      error: () => { this.loadingMedicines = false; }
    });
  }

  onMedicineSearch(event: any) {
    const term = event.detail.value ?? '';
    this.medicineSearchTerm = term;
    this.searchMedicines(term);
  }

  addToCart(medicine: MedicineDto) {
    const existing = this.cartItems.find(c => c.medicine.id === medicine.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ medicine, quantity: 1, unitPrice: medicine.unitPrice });
    }
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
  }

  updateQty(index: number, delta: number) {
    const item = this.cartItems[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.cartItems.splice(index, 1);
    } else {
      item.quantity = newQty;
    }
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discountAmount);
  }

  searchCustomers(event: any) {
    const term = event.detail.value ?? '';
    this.customerSearchTerm = term;
    if (term.length < 2) { this.customerResults = []; return; }
    this.pharmacyService.getCustomers(term, 0, 5).subscribe({
      next: res => { this.customerResults = res.data?.content ?? []; }
    });
  }

  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    this.customerResults = [];
    this.customerSearchTerm = '';
  }

  clearCustomer() {
    this.selectedCustomer = null;
  }

  onCustomerModeChange(event: any) {
    this.customerMode = event.detail.value;
    this.selectedCustomer = null;
    this.walkinName = '';
    this.walkinPhone = '';
  }

  onPaymentChange(event: any) {
    this.paymentMethod = event.detail.value;
  }

  get canSubmit(): boolean {
    return this.cartItems.length > 0 && !!this.paymentMethod;
  }

  async completeSale() {
    if (!this.canSubmit) return;

    const loading = await this.loadingCtrl.create({ message: 'Processing sale...' });
    await loading.present();
    this.submitting = true;

    const processedBy = localStorage.getItem('username') ?? 'unknown';

    const req: CreateSaleRequest = {
      customerId: this.selectedCustomer?.id ?? undefined,
      customerName: this.selectedCustomer?.name ?? this.walkinName ?? undefined,
      customerPhone: this.selectedCustomer?.phone ?? this.walkinPhone ?? undefined,
      items: this.cartItems.map(c => ({
        medicineId: c.medicine.id,
        medicineName: c.medicine.name,
        medicineUnit: c.medicine.unit,
        quantity: c.quantity,
        unitPrice: c.unitPrice
      })),
      discountAmount: this.discountAmount || 0,
      paymentMethod: this.paymentMethod,
      notes: this.notes || undefined,
      processedBy
    };

    this.pharmacyService.createSale(req).subscribe({
      next: async res => {
        await loading.dismiss();
        this.submitting = false;
        const saleNumber = res.data?.saleNumber ?? '';
        const toast = await this.toastCtrl.create({
          message: `Sale ${saleNumber} completed! Total: ₹${res.data?.totalAmount}`,
          duration: 3000, color: 'success'
        });
        await toast.present();
        this.clearCart();
      },
      error: async () => {
        await loading.dismiss();
        this.submitting = false;
      }
    });
  }

  clearCart() {
    this.cartItems = [];
    this.discountAmount = 0;
    this.notes = '';
    this.walkinName = '';
    this.walkinPhone = '';
    this.selectedCustomer = null;
    this.medicineSearchTerm = '';
    this.searchMedicines('');
  }

  goToHistory() {
    this.router.navigate(['/pharmacy/history']);
  }
}
