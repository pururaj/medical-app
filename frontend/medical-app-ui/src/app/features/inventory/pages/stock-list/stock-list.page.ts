import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonItem, IonLabel, IonChip, IonCard, IonCardContent, IonSegment,
  IonSegmentButton, IonSpinner, IonIcon, IonBadge, IonBackButton,
  IonRefresher, IonRefresherContent, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  warningOutline, addOutline, cubeOutline, alertCircleOutline, timeOutline
} from 'ionicons/icons';
import { InventoryService, InventoryStockDto, MedicineDto } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: 'stock-list.page.html',
  styleUrls: ['stock-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonItem, IonLabel, IonChip, IonCard, IonCardContent, IonSegment,
    IonSegmentButton, IonSpinner, IonIcon, IonBadge, IonBackButton,
    IonRefresher, IonRefresherContent, IonFab, IonFabButton
  ]
})
export class StockListPage implements OnInit {
  activeSegment = 'all';
  allStock: InventoryStockDto[] = [];
  lowStockMedicines: MedicineDto[] = [];
  loading = false;

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {
    addIcons({ warningOutline, addOutline, cubeOutline, alertCircleOutline, timeOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(event?: any) {
    this.loading = true;
    this.inventoryService.getAllStock().subscribe({
      next: res => {
        this.allStock = res.data?.content ?? [];
        event?.target?.complete();
        if (this.activeSegment !== 'low') this.loading = false;
      }
    });
    this.inventoryService.getLowStock().subscribe({
      next: res => {
        this.lowStockMedicines = res.data ?? [];
        this.loading = false;
      }
    });
  }

  onSegmentChange(event: Event) {
    this.activeSegment = (event as CustomEvent).detail.value;
  }

  adjustStock() {
    this.router.navigate(['/inventory/stock/adjust']);
  }

  viewMedicine(id: number) {
    this.router.navigate(['/inventory/medicines', id]);
  }

  isExpiringSoon(dateStr?: string): boolean {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 30);
    return expiry <= threshold;
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      TABLET: 'primary', CAPSULE: 'secondary', SYRUP: 'tertiary',
      INJECTION: 'danger', CREAM: 'warning', DROPS: 'success', OTHER: 'medium'
    };
    return colors[cat] ?? 'medium';
  }
}
