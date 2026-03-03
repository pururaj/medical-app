import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonInput,
  IonCard, IonCardContent, IonIcon, IonChip, IonList,
  IonSpinner, IonBackButton, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline, cartOutline, cashOutline, trendingUpOutline, addOutline } from 'ionicons/icons';
import { PharmacyService, SaleDto, POSSummaryDto } from '../../../../core/services/pharmacy.service';

@Component({
  selector: 'app-sales-history',
  templateUrl: 'sales-history.page.html',
  styleUrls: ['sales-history.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonInput,
    IonCard, IonCardContent, IonIcon, IonChip, IonList,
    IonSpinner, IonBackButton, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonText
  ]
})
export class SalesHistoryPage implements OnInit {
  sales: SaleDto[] = [];
  summary: POSSummaryDto | null = null;
  loading = true;
  statusFilter = '';
  startDate = '';
  endDate = '';

  readonly statuses = ['', 'COMPLETED', 'PARTIALLY_RETURNED', 'RETURNED', 'CANCELLED'];

  constructor(private pharmacyService: PharmacyService, private router: Router) {
    addIcons({ receiptOutline, cartOutline, cashOutline, trendingUpOutline, addOutline });
  }

  ngOnInit() { this.loadData(); }

  loadData(event?: any) {
    this.loading = true;
    this.pharmacyService.getSummary().subscribe({
      next: res => { this.summary = res.data; }
    });
    this.pharmacyService.getSales(0, 50, this.statusFilter || undefined, this.startDate || undefined, this.endDate || undefined).subscribe({
      next: res => {
        this.sales = res.data?.content ?? [];
        this.loading = false;
        event?.target?.complete();
      },
      error: () => { this.loading = false; event?.target?.complete(); }
    });
  }

  onStatusChange(event: any) {
    this.statusFilter = event.detail.value;
    this.loadData();
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'success', PARTIALLY_RETURNED: 'warning',
      RETURNED: 'medium', CANCELLED: 'danger'
    };
    return map[status] ?? 'medium';
  }

  viewSale(id: number) {
    this.router.navigate(['/pharmacy/history', id]);
  }

  goToPOS() {
    this.router.navigate(['/pharmacy']);
  }
}
