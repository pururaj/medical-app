import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonBadge, IonFab, IonFabButton, IonIcon, IonButtons,
  IonBackButton, IonSelect, IonSelectOption, IonSpinner, IonNote,
  IonSearchbar, IonButton, IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, flaskOutline } from 'ionicons/icons';
import { LabService, LabOrderDto } from '../../../../core/services/lab.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
    IonLabel, IonBadge, IonFab, IonFabButton, IonIcon, IonButtons,
    IonBackButton, IonSelect, IonSelectOption, IonSpinner, IonNote,
    IonSearchbar, IonButton, IonInput
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/lab"></ion-back-button>
        </ion-buttons>
        <ion-title>Lab Orders</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <ion-select [(ngModel)]="selectedStatus" placeholder="All Statuses" (ionChange)="load()" style="flex:1;border:1px solid #ddd;border-radius:8px;padding:4px 8px;">
          <ion-select-option value="">All</ion-select-option>
          <ion-select-option value="PENDING">Pending</ion-select-option>
          <ion-select-option value="SAMPLE_COLLECTED">Sample Collected</ion-select-option>
          <ion-select-option value="IN_PROGRESS">In Progress</ion-select-option>
          <ion-select-option value="COMPLETED">Completed</ion-select-option>
          <ion-select-option value="CANCELLED">Cancelled</ion-select-option>
        </ion-select>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <ion-input type="date" [(ngModel)]="startDate" label="From" labelPlacement="stacked" fill="outline" (ionChange)="load()"></ion-input>
        <ion-input type="date" [(ngModel)]="endDate" label="To" labelPlacement="stacked" fill="outline" (ionChange)="load()"></ion-input>
      </div>

      <div *ngIf="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <ion-list *ngIf="!loading">
        <ion-item *ngFor="let order of orders" [routerLink]="['/lab/orders', order.id]" detail>
          <ion-label>
            <h2>{{ order.orderNumber }}</h2>
            <p>{{ order.patientName }} &bull; {{ order.items?.length || 0 }} test(s)</p>
            <ion-note>{{ order.createdAt | date:'dd MMM yyyy HH:mm' }}</ion-note>
          </ion-label>
          <ion-badge slot="end" [color]="statusColor(order.status)">{{ order.status }}</ion-badge>
        </ion-item>
        <ion-item *ngIf="orders.length === 0">
          <ion-label class="ion-text-center" color="medium">No orders found</ion-label>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/lab/orders/new">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class OrderListPage implements OnInit {
  orders: LabOrderDto[] = [];
  loading = false;
  selectedStatus = '';
  startDate = '';
  endDate = '';

  constructor(private labService: LabService, private router: Router) {
    addIcons({ addOutline, flaskOutline });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.labService.getOrders(0, 50,
      this.selectedStatus || undefined,
      this.startDate || undefined,
      this.endDate || undefined
    ).subscribe({
      next: res => { this.orders = res.data?.content || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'warning', SAMPLE_COLLECTED: 'tertiary',
      IN_PROGRESS: 'primary', COMPLETED: 'success', CANCELLED: 'medium'
    };
    return map[status] || 'medium';
  }
}
