import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardContent, IonIcon, IonChip, IonList, IonItem, IonLabel,
  IonSpinner, IonBackButton, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline, returnDownBackOutline, personOutline, cashOutline } from 'ionicons/icons';
import { PharmacyService, SaleDto } from '../../../../core/services/pharmacy.service';

@Component({
  selector: 'app-sale-detail',
  templateUrl: 'sale-detail.page.html',
  styleUrls: ['sale-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardContent, IonIcon, IonChip, IonList, IonItem, IonLabel,
    IonSpinner, IonBackButton, IonText
  ]
})
export class SaleDetailPage implements OnInit {
  sale: SaleDto | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pharmacyService: PharmacyService
  ) {
    addIcons({ receiptOutline, returnDownBackOutline, personOutline, cashOutline });
  }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.pharmacyService.getSaleById(id).subscribe({
      next: res => { this.sale = res.data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get canReturn(): boolean {
    return this.sale?.status === 'COMPLETED' || this.sale?.status === 'PARTIALLY_RETURNED';
  }

  processReturn() {
    this.router.navigate(['/pharmacy/returns/new'], { queryParams: { saleId: this.sale?.id } });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'success', PARTIALLY_RETURNED: 'warning',
      RETURNED: 'medium', CANCELLED: 'danger'
    };
    return map[status] ?? 'medium';
  }

  get subtotal(): number {
    return this.sale?.items.reduce((s, i) => s + i.lineTotal, 0) ?? 0;
  }
}
