import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonSpinner, IonText, IonIcon, IonSelect, IonSelectOption,
  IonGrid, IonRow, IonCol, IonItem, IonLabel, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  receiptOutline, trendingUpOutline, trendingDownOutline,
  calculatorOutline, arrowBackOutline, refreshOutline,
  homeOutline
} from 'ionicons/icons';
import { InventoryService, GstMonthlySummaryDto, GstSaleSummaryDto } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-gst-monthly-summary',
  templateUrl: 'gst-monthly-summary.page.html',
  styleUrls: ['gst-monthly-summary.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, FormsModule, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonSpinner, IonText, IonIcon, IonSelect, IonSelectOption,
    IonGrid, IonRow, IonCol, IonItem, IonLabel
  ]
})
export class GstMonthlySummaryPage implements OnInit {
  loading = false;
  selectedYear: number;
  selectedMonth: number;
  purchaseSummary: GstMonthlySummaryDto | null = null;
  saleSummary: GstSaleSummaryDto | null = null;

  years: number[] = [];
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ homeOutline, receiptOutline, trendingUpOutline, trendingDownOutline, calculatorOutline, arrowBackOutline, refreshOutline });
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) this.years.push(y);
  }

  ngOnInit() { this.loadSummary(); }

  loadSummary() {
    this.loading = true;
    this.purchaseSummary = null;
    this.saleSummary = null;

    this.inventoryService.getPurchaseGstSummary(this.selectedYear, this.selectedMonth).subscribe({
      next: res => { this.purchaseSummary = res.data; this.checkDone(); },
      error: () => { this.showToast('Failed to load purchase data'); this.loading = false; }
    });

    this.inventoryService.getSaleGstSummary(this.selectedYear, this.selectedMonth).subscribe({
      next: res => { this.saleSummary = res.data; this.checkDone(); },
      error: () => { this.showToast('Failed to load sale data'); this.loading = false; }
    });
  }

  private checkDone() {
    if (this.purchaseSummary !== null && this.saleSummary !== null) this.loading = false;
  }

  get netItcCgst() { return (this.purchaseSummary?.purchaseCgst ?? 0) - (this.saleSummary?.cgstAmount ?? 0); }
  get netItcSgst() { return (this.purchaseSummary?.purchaseSgst ?? 0) - (this.saleSummary?.sgstAmount ?? 0); }
  get netItcIgst() { return (this.purchaseSummary?.purchaseIgst ?? 0) - (this.saleSummary?.igstAmount ?? 0); }
  get netItcTotal() { return this.netItcCgst + this.netItcSgst + this.netItcIgst; }
  get monthLabel() { return this.months.find(m => m.value === this.selectedMonth)?.label ?? ''; }

  goBack() { this.router.navigate(['/inventory']); }
  goToPurchaseInvoices() { this.router.navigate(['/inventory/gst-purchase-invoices']); }
  goToSaleInvoices() { this.router.navigate(['/inventory/gst-sale-invoices']); }

  private async showToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color: 'danger' });
    await toast.present();
  }
}
