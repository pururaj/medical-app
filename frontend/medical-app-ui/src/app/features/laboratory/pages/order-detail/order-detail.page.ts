import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonBadge, IonSpinner, IonSelect, IonSelectOption, IonInput, IonNote, IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { beakerOutline, checkmarkCircleOutline, closeCircleOutline, timeOutline } from 'ionicons/icons';
import { LabService, LabOrderDto, TestResultDto } from '../../../../core/services/lab.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBadge, IonSpinner, IonSelect, IonSelectOption, IonInput, IonNote, IonList
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/lab/orders"></ion-back-button>
        </ion-buttons>
        <ion-title>Order Detail</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center ion-padding"><ion-spinner></ion-spinner></div>

      <ng-container *ngIf="!loading && order">
        <!-- Header -->
        <ion-card>
          <ion-card-content>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <h2 style="margin:0;font-weight:bold">{{ order.orderNumber }}</h2>
                <p style="margin:4px 0">{{ order.patientName }}</p>
                <small color="medium">{{ order.patientPhone }}</small>
              </div>
              <ion-badge [color]="statusColor(order.status)">{{ order.status }}</ion-badge>
            </div>
            <p *ngIf="order.doctorName"><strong>Doctor:</strong> {{ order.doctorName }}</p>
            <p *ngIf="order.notes"><strong>Notes:</strong> {{ order.notes }}</p>
            <p><strong>Created:</strong> {{ order.createdAt | date:'dd MMM yyyy HH:mm' }}</p>
          </ion-card-content>
        </ion-card>

        <!-- Sample Collection -->
        <ion-card *ngIf="order.status === 'PENDING'">
          <ion-card-header><ion-card-title>Collect Sample</ion-card-title></ion-card-header>
          <ion-card-content>
            <form [formGroup]="sampleForm">
              <ion-item>
                <ion-input label="Sample ID *" labelPlacement="stacked" formControlName="sampleId" placeholder="e.g. SMP-001"></ion-input>
              </ion-item>
              <ion-item>
                <ion-select label="Sample Type" labelPlacement="stacked" formControlName="sampleType">
                  <ion-select-option value="BLOOD">Blood</ion-select-option>
                  <ion-select-option value="URINE">Urine</ion-select-option>
                  <ion-select-option value="STOOL">Stool</ion-select-option>
                  <ion-select-option value="SWAB">Swab</ion-select-option>
                  <ion-select-option value="OTHER">Other</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-input label="Collected By *" labelPlacement="stacked" formControlName="collectedBy" placeholder="Staff name"></ion-input>
              </ion-item>
              <ion-button expand="block" class="ion-margin-top" [disabled]="sampleForm.invalid || collecting" (click)="collectSample()">
                <ion-icon name="beaker-outline" slot="start"></ion-icon>
                {{ collecting ? 'Processing...' : 'Collect Sample' }}
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Sample Info (post-collection) -->
        <ion-card *ngIf="order.sampleId">
          <ion-card-header><ion-card-title>Sample Info</ion-card-title></ion-card-header>
          <ion-card-content>
            <p><strong>Sample ID:</strong> {{ order.sampleId }}</p>
            <p *ngIf="order.sampleType"><strong>Type:</strong> {{ order.sampleType }}</p>
            <p><strong>Collected By:</strong> {{ order.collectedBy }}</p>
            <p><strong>Collected At:</strong> {{ order.collectedAt | date:'dd MMM yyyy HH:mm' }}</p>
          </ion-card-content>
        </ion-card>

        <!-- Order Items -->
        <ion-card>
          <ion-card-header><ion-card-title>Tests ({{ order.items.length }})</ion-card-title></ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let item of order.items">
                <ion-label>
                  <h3>{{ item.testName }}</h3>
                  <ion-note>{{ item.testCode }} &bull; ₹{{ item.price }}</ion-note>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Results -->
        <ion-card *ngIf="order.status !== 'PENDING' && order.status !== 'CANCELLED'">
          <ion-card-header>
            <ion-card-title>Results</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div *ngIf="results.length === 0" class="ion-text-center" style="color:var(--ion-color-medium);padding:8px">No results entered yet</div>
            <ion-list *ngIf="results.length > 0">
              <ion-item *ngFor="let r of results">
                <ion-label>
                  <h3>{{ r.testName }}</h3>
                  <p>{{ r.resultValue }} {{ r.unit }}</p>
                  <ion-note *ngIf="r.referenceRange">Ref: {{ r.referenceRange }}</ion-note>
                </ion-label>
                <ion-badge slot="end" [color]="r.isAbnormal ? 'danger' : 'success'">
                  {{ r.isAbnormal ? 'Abnormal' : 'Normal' }}
                </ion-badge>
              </ion-item>
            </ion-list>
            <ion-button expand="block" fill="outline" class="ion-margin-top"
              [routerLink]="['/lab/results/new']" [queryParams]="{orderId: order.id}"
              *ngIf="order.status !== 'COMPLETED'">
              Enter Results
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <div style="display:flex;flex-direction:column;gap:8px;padding:8px 0">
          <ion-button expand="block" color="tertiary"
            *ngIf="order.status === 'SAMPLE_COLLECTED'" (click)="markInProgress()">
            <ion-icon name="time-outline" slot="start"></ion-icon>
            Mark In Progress
          </ion-button>
          <ion-button expand="block" color="success"
            *ngIf="order.status === 'IN_PROGRESS'" (click)="complete()">
            <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
            Complete Order
          </ion-button>
          <ion-button expand="block" color="danger" fill="outline"
            *ngIf="order.status === 'PENDING' || order.status === 'SAMPLE_COLLECTED'" (click)="cancel()">
            <ion-icon name="close-circle-outline" slot="start"></ion-icon>
            Cancel Order
          </ion-button>
        </div>
      </ng-container>
    </ion-content>
  `
})
export class OrderDetailPage implements OnInit {
  order: LabOrderDto | null = null;
  results: TestResultDto[] = [];
  loading = true;
  collecting = false;

  sampleForm = this.fb.group({
    sampleId: ['', Validators.required],
    sampleType: ['BLOOD'],
    collectedBy: ['', Validators.required]
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private labService: LabService,
    private fb: FormBuilder
  ) {
    addIcons({ beakerOutline, checkmarkCircleOutline, closeCircleOutline, timeOutline });
  }

  ngOnInit() { this.load(); }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.labService.getOrderById(id).subscribe({
      next: res => {
        this.order = res.data;
        this.loading = false;
        if (this.order && this.order.status !== 'PENDING' && this.order.status !== 'CANCELLED') {
          this.loadResults(id);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  loadResults(orderId: number) {
    this.labService.getResultsByOrderId(orderId).subscribe({
      next: res => { this.results = res.data || []; }
    });
  }

  collectSample() {
    if (this.sampleForm.invalid || !this.order) return;
    this.collecting = true;
    const val = this.sampleForm.value;
    this.labService.collectSample(this.order.id, {
      sampleId: val.sampleId!,
      sampleType: val.sampleType || undefined,
      collectedBy: val.collectedBy!
    }).subscribe({
      next: res => { this.order = res.data; this.collecting = false; },
      error: () => { this.collecting = false; }
    });
  }

  markInProgress() {
    if (!this.order) return;
    this.labService.markInProgress(this.order.id).subscribe({
      next: res => { this.order = res.data; }
    });
  }

  complete() {
    if (!this.order) return;
    this.labService.completeOrder(this.order.id).subscribe({
      next: res => { this.order = res.data; }
    });
  }

  cancel() {
    if (!this.order) return;
    this.labService.cancelOrder(this.order.id).subscribe({
      next: res => { this.order = res.data; }
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
