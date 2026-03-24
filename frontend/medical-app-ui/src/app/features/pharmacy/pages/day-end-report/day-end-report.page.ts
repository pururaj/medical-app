import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonIcon, IonSpinner, IonBackButton, IonBadge, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, trendingUpOutline, arrowDownOutline, swapHorizontalOutline,
  cashOutline, cardOutline, phonePortraitOutline, shieldCheckmarkOutline,
  medkitOutline, timeOutline, printOutline, refreshOutline
} from 'ionicons/icons';
import { PharmacyService, DayEndReportDto } from '../../../../core/services/pharmacy.service';

@Component({
  selector: 'app-day-end-report',
  templateUrl: 'day-end-report.page.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonIcon, IonSpinner, IonBackButton, IonBadge, IonRefresher, IonRefresherContent
  ]
})
export class DayEndReportPage implements OnInit {
  selectedDate: string = new Date().toISOString().slice(0, 10);
  report: DayEndReportDto | null = null;
  loading = false;

  readonly paymentIcons: Record<string, string> = {
    CASH: 'cash-outline',
    CARD: 'card-outline',
    UPI: 'phone-portrait-outline',
    INSURANCE: 'shield-checkmark-outline'
  };

  constructor(
    private pharmacyService: PharmacyService,
    private router: Router
  ) {
    addIcons({
      calendarOutline, trendingUpOutline, arrowDownOutline, swapHorizontalOutline,
      cashOutline, cardOutline, phonePortraitOutline, shieldCheckmarkOutline,
      medkitOutline, timeOutline, printOutline, refreshOutline
    });
  }

  ngOnInit() { this.loadReport(); }

  loadReport(event?: any) {
    this.loading = true;
    this.pharmacyService.getDayEndReport(this.selectedDate).subscribe({
      next: res => {
        this.report = res.data;
        this.loading = false;
        event?.target?.complete();
      },
      error: () => { this.loading = false; event?.target?.complete(); }
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.loadReport();
  }

  get paymentMethods(): string[] {
    return this.report ? Object.keys(this.report.paymentBreakdown ?? {}) : [];
  }

  paymentAmount(method: string): number {
    return +(this.report?.paymentBreakdown?.[method]?.amount ?? 0);
  }

  paymentCount(method: string): number {
    return this.report?.paymentBreakdown?.[method]?.count ?? 0;
  }

  get maxHourRevenue(): number {
    return Math.max(...(this.report?.hourlySales?.map(h => +h.revenue) ?? [1]));
  }

  barWidth(revenue: number): number {
    const max = this.maxHourRevenue;
    return max > 0 ? Math.round((revenue / max) * 100) : 0;
  }

  printReport() { window.print(); }
}
