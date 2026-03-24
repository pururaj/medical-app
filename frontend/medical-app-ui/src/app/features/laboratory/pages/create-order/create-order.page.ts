import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonItem, IonLabel, IonInput, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonCheckbox, IonSearchbar, IonSpinner, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { LabService, TestCatalogueDto } from '../../../../core/services/lab.service';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonItem, IonLabel, IonInput, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonCheckbox, IonSearchbar, IonSpinner, IonNote
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/lab/orders"></ion-back-button>
        </ion-buttons>
        <ion-title>New Lab Order</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <ion-card>
          <ion-card-header><ion-card-title>Patient Info</ion-card-title></ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-input label="Patient Name *" labelPlacement="stacked" formControlName="patientName" placeholder="Full name"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Patient Phone" labelPlacement="stacked" formControlName="patientPhone" placeholder="Phone number"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Doctor Name" labelPlacement="stacked" formControlName="doctorName" placeholder="Referring doctor"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Processed By" labelPlacement="stacked" formControlName="processedBy" placeholder="Staff name"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Notes" labelPlacement="stacked" formControlName="notes" placeholder="Optional notes"></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header><ion-card-title>Select Tests</ion-card-title></ion-card-header>
          <ion-card-content>
            <ion-searchbar [(ngModel)]="searchKeyword" [ngModelOptions]="{standalone:true}" (ionInput)="searchCatalogue()" placeholder="Search tests..."></ion-searchbar>
            <div *ngIf="loadingCatalogue" class="ion-text-center"><ion-spinner></ion-spinner></div>
            <ion-item *ngFor="let test of catalogue">
              <ion-checkbox slot="start" [checked]="isSelected(test.id)" (ionChange)="toggleTest(test, $event)"></ion-checkbox>
              <ion-label>
                <h3>{{ test.testName }}</h3>
                <ion-note>{{ test.testCode }} &bull; ₹{{ test.price }}</ion-note>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <div *ngIf="selectedTests.length > 0" style="padding:0 4px 8px">
          <strong>Selected ({{ selectedTests.length }}):</strong> {{ selectedTestNames }}
        </div>

        <ion-button expand="block" [disabled]="form.invalid || selectedTests.length === 0 || submitting" (click)="submit()">
          <ion-icon name="checkmark-outline" slot="start"></ion-icon>
          {{ submitting ? 'Creating...' : 'Create Order' }}
        </ion-button>
      </form>
    </ion-content>
  `
})
export class CreateOrderPage implements OnInit {
  form = this.fb.group({
    patientName: ['', Validators.required],
    patientPhone: [''],
    doctorName: [''],
    processedBy: [''],
    notes: ['']
  });

  catalogue: TestCatalogueDto[] = [];
  selectedTests: TestCatalogueDto[] = [];
  searchKeyword = '';
  loadingCatalogue = false;
  submitting = false;

  constructor(private fb: FormBuilder, private labService: LabService, private router: Router) {
    addIcons({ checkmarkOutline });
  }

  ngOnInit() { this.searchCatalogue(); }

  searchCatalogue() {
    this.loadingCatalogue = true;
    this.labService.getCatalogues(this.searchKeyword || undefined, 0, 50).subscribe({
      next: res => { this.catalogue = res.data?.content || []; this.loadingCatalogue = false; },
      error: () => { this.loadingCatalogue = false; }
    });
  }

  get selectedTestNames(): string {
    return this.selectedTests.map(t => t.testName).join(', ');
  }

  isSelected(id: number): boolean {
    return this.selectedTests.some(t => t.id === id);
  }

  toggleTest(test: TestCatalogueDto, event: any) {
    if (event.detail.checked) {
      if (!this.isSelected(test.id)) this.selectedTests.push(test);
    } else {
      this.selectedTests = this.selectedTests.filter(t => t.id !== test.id);
    }
  }

  submit() {
    if (this.form.invalid || this.selectedTests.length === 0) return;
    this.submitting = true;
    const val = this.form.value;
    this.labService.createOrder({
      patientId: 0,
      patientName: val.patientName!,
      patientPhone: val.patientPhone || undefined,
      doctorName: val.doctorName || undefined,
      processedBy: val.processedBy || undefined,
      notes: val.notes || undefined,
      items: this.selectedTests.map(t => ({ testCatalogueId: t.id }))
    }).subscribe({
      next: res => {
        this.submitting = false;
        this.router.navigate(['/lab/orders', res.data.id]);
      },
      error: () => { this.submitting = false; }
    });
  }
}
