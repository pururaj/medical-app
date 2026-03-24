import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonSpinner, IonInput, IonToggle, IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { LabService, LabOrderDto } from '../../../../core/services/lab.service';

@Component({
  selector: 'app-result-entry',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonSpinner, IonInput, IonToggle, IonTextarea
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="'/lab/orders/' + orderId"></ion-back-button>
        </ion-buttons>
        <ion-title>Enter Results</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center ion-padding"><ion-spinner></ion-spinner></div>

      <ng-container *ngIf="!loading && order">
        <p style="font-weight:bold;margin-bottom:12px">{{ order.orderNumber }} &mdash; {{ order.patientName }}</p>

        <form [formGroup]="form">
          <ion-card *ngFor="let item of order.items; let i = index" formArrayName="results">
            <ion-card-header>
              <ion-card-title>{{ item.testName }} <small style="font-size:12px;color:gray">({{ item.testCode }})</small></ion-card-title>
            </ion-card-header>
            <ion-card-content [formGroupName]="i">
              <ion-item>
                <ion-input label="Result Value *" labelPlacement="stacked" formControlName="resultValue" placeholder="Enter result"></ion-input>
              </ion-item>
              <ion-item>
                <ion-input label="Unit" labelPlacement="stacked" formControlName="unit" placeholder="e.g. mg/dL"></ion-input>
              </ion-item>
              <ion-item>
                <ion-input label="Reference Range" labelPlacement="stacked" formControlName="referenceRange" placeholder="e.g. 70-100"></ion-input>
              </ion-item>
              <ion-item>
                <ion-toggle formControlName="isAbnormal">Mark as Abnormal</ion-toggle>
              </ion-item>
              <ion-item>
                <ion-textarea label="Remarks" labelPlacement="stacked" formControlName="remarks" placeholder="Optional remarks" rows="2"></ion-textarea>
              </ion-item>
              <ion-item>
                <ion-input label="Entered By" labelPlacement="stacked" formControlName="enteredBy" placeholder="Staff name"></ion-input>
              </ion-item>
            </ion-card-content>
          </ion-card>

          <ion-button expand="block" [disabled]="form.invalid || submitting" (click)="submit()">
            <ion-icon name="save-outline" slot="start"></ion-icon>
            {{ submitting ? 'Saving...' : 'Save All Results' }}
          </ion-button>
        </form>
      </ng-container>
    </ion-content>
  `
})
export class ResultEntryPage implements OnInit {
  order: LabOrderDto | null = null;
  orderId = 0;
  loading = true;
  submitting = false;

  form = this.fb.group({
    results: this.fb.array([])
  });

  get resultsArray() { return this.form.get('results') as FormArray; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private labService: LabService,
    private fb: FormBuilder
  ) {
    addIcons({ saveOutline });
  }

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.queryParamMap.get('orderId'));
    this.labService.getOrderById(this.orderId).subscribe({
      next: res => {
        this.order = res.data;
        this.buildForm();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  buildForm() {
    if (!this.order) return;
    this.order.items.forEach(() => {
      this.resultsArray.push(this.fb.group({
        resultValue: ['', Validators.required],
        unit: [''],
        referenceRange: [''],
        isAbnormal: [false],
        remarks: [''],
        enteredBy: ['']
      }));
    });
  }

  submit() {
    if (!this.order || this.form.invalid) return;
    this.submitting = true;
    const items = this.order.items;
    const values = this.resultsArray.value;
    const requests = items.map((item, i) => ({
      labOrderItemId: item.id,
      resultValue: values[i].resultValue,
      unit: values[i].unit || undefined,
      referenceRange: values[i].referenceRange || undefined,
      isAbnormal: values[i].isAbnormal || false,
      remarks: values[i].remarks || undefined,
      enteredBy: values[i].enteredBy || undefined
    }));

    let completed = 0;
    requests.forEach(req => {
      this.labService.createResult(req).subscribe({
        next: () => {
          completed++;
          if (completed === requests.length) {
            this.submitting = false;
            this.router.navigate(['/lab/orders', this.orderId]);
          }
        },
        error: () => {
          completed++;
          if (completed === requests.length) {
            this.submitting = false;
            this.router.navigate(['/lab/orders', this.orderId]);
          }
        }
      });
    });
  }
}
