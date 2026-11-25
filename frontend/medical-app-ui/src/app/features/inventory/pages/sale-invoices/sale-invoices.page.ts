import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardContent, IonChip, IonSpinner, IonText, IonIcon,
  IonSelect, IonSelectOption, IonItem, IonLabel,
  IonInfiniteScroll, IonInfiniteScrollContent, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, receiptOutline, chevronDownOutline, chevronUpOutline,
  homeOutline
} from 'ionicons/icons';
import { environment } from '../../../../../environments/environment';

interface SaleItemDto {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
}

interface SaleDto {
  id: number;
  saleNumber: string;
  customerName?: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  gstRate: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: SaleItemDto[];
}

@Component({
  selector: 'app-sale-invoices',
  templateUrl: 'sale-invoices.page.html',
  styleUrls: ['sale-invoices.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, FormsModule, DatePipe, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardContent, IonChip, IonSpinner, IonText, IonIcon,
    IonSelect, IonSelectOption, IonItem, IonLabel,
    IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class SaleInvoicesPage implements OnInit {
  loading = false;
  sales: SaleDto[] = [];
  expandedId: number | null = null;
  page = 0;
  hasMore = true;

  selectedYear: number;
  selectedMonth: number;

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
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ homeOutline, arrowBackOutline, receiptOutline, chevronDownOutline, chevronUpOutline });
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) this.years.push(y);
  }

  ngOnInit() { this.loadSales(); }

  get startDate() {
    return `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-01`;
  }

  get endDate() {
    const lastDay = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    return `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${lastDay}`;
  }

  loadSales(reset = true) {
    if (reset) { this.page = 0; this.sales = []; this.hasMore = true; }
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.page).set('size', 20)
      .set('startDate', this.startDate)
      .set('endDate', this.endDate);
    this.http.get<any>(`${environment.apiUrl}/pharmacy/sales`, { params }).subscribe({
      next: res => {
        const newSales = res.data?.content ?? [];
        this.sales = reset ? newSales : [...this.sales, ...newSales];
        this.hasMore = !res.data?.last;
        this.loading = false;
      },
      error: () => { this.loading = false; this.showToast('Failed to load sales'); }
    });
  }

  loadMore(event: any) {
    this.page++;
    let params = new HttpParams()
      .set('page', this.page).set('size', 20)
      .set('startDate', this.startDate)
      .set('endDate', this.endDate);
    this.http.get<any>(`${environment.apiUrl}/pharmacy/sales`, { params }).subscribe({
      next: res => {
        this.sales = [...this.sales, ...(res.data?.content ?? [])];
        this.hasMore = !res.data?.last;
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  get monthLabel() { return this.months.find(m => m.value === this.selectedMonth)?.label ?? ''; }

  goBack() { this.router.navigate(['/inventory/gst-summary']); }

  private async showToast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: 'danger' });
    await t.present();
  }
}
