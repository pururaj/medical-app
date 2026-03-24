import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton,
  IonIcon, IonButtons, IonBackButton, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flaskOutline, listOutline, addCircleOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, timeOutline, hourglassOutline } from 'ionicons/icons';
import { LabService, LabDashboardDto } from '../../../../core/services/lab.service';

@Component({
  selector: 'app-lab-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton,
    IonIcon, IonButtons, IonBackButton, IonSpinner
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Laboratory</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <ng-container *ngIf="!loading && dashboard">
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-card>
                <ion-card-content class="stat-card">
                  <ion-icon name="list-outline" color="primary"></ion-icon>
                  <div class="stat-value">{{ dashboard.todayOrders }}</div>
                  <div class="stat-label">Today's Orders</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card>
                <ion-card-content class="stat-card">
                  <ion-icon name="hourglass-outline" color="warning"></ion-icon>
                  <div class="stat-value">{{ dashboard.pendingSamples }}</div>
                  <div class="stat-label">Pending Samples</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card>
                <ion-card-content class="stat-card">
                  <ion-icon name="time-outline" color="tertiary"></ion-icon>
                  <div class="stat-value">{{ dashboard.inProgress }}</div>
                  <div class="stat-label">In Progress</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card>
                <ion-card-content class="stat-card">
                  <ion-icon name="checkmark-circle-outline" color="success"></ion-icon>
                  <div class="stat-value">{{ dashboard.completedToday }}</div>
                  <div class="stat-label">Completed Today</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card>
                <ion-card-content class="stat-card">
                  <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
                  <div class="stat-value">{{ dashboard.abnormalResults }}</div>
                  <div class="stat-label">Abnormal Results</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card>
                <ion-card-content class="stat-card">
                  <ion-icon name="albums-outline" color="medium"></ion-icon>
                  <div class="stat-value">{{ dashboard.totalCatalogueTests }}</div>
                  <div class="stat-label">Catalogue Tests</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button expand="block" routerLink="/lab/orders/new">
                <ion-icon name="add-circle-outline" slot="start"></ion-icon>
                New Order
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button expand="block" fill="outline" routerLink="/lab/orders">
                <ion-icon name="list-outline" slot="start"></ion-icon>
                All Orders
              </ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-button expand="block" fill="outline" color="medium" routerLink="/lab/catalogue">
                <ion-icon name="albums-outline" slot="start"></ion-icon>
                Test Catalogue
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ng-container>
    </ion-content>
  `,
  styles: [`
    .stat-card {
      text-align: center;
      padding: 12px 8px;
    }
    .stat-card ion-icon {
      font-size: 28px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      margin: 4px 0;
    }
    .stat-label {
      font-size: 12px;
      color: var(--ion-color-medium);
    }
  `]
})
export class LabDashboardPage implements OnInit {
  dashboard: LabDashboardDto | null = null;
  loading = true;

  constructor(private labService: LabService) {
    addIcons({ flaskOutline, listOutline, addCircleOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, timeOutline, hourglassOutline });
  }

  ngOnInit() {
    this.labService.getDashboard().subscribe({
      next: res => {
        this.dashboard = res.data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
