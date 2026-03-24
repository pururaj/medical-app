import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonItem, IonInput, IonSelect, IonSelectOption, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { LabService } from '../../../../core/services/lab.service';

@Component({
  selector: 'app-catalogue-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonItem, IonInput, IonSelect, IonSelectOption, IonSpinner
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/lab/catalogue"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Edit Test' : 'New Test' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center ion-padding"><ion-spinner></ion-spinner></div>

      <form [formGroup]="form" *ngIf="!loading">
        <ion-item>
          <ion-input label="Test Code *" labelPlacement="stacked" formControlName="testCode" placeholder="e.g. CBC" [readonly]="isEdit"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Test Name *" labelPlacement="stacked" formControlName="testName" placeholder="Full name"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Category" labelPlacement="stacked" formControlName="category" placeholder="e.g. Haematology"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Description" labelPlacement="stacked" formControlName="description" placeholder="Brief description"></ion-input>
        </ion-item>
        <ion-item>
          <ion-select label="Sample Type *" labelPlacement="stacked" formControlName="sampleType">
            <ion-select-option value="BLOOD">Blood</ion-select-option>
            <ion-select-option value="URINE">Urine</ion-select-option>
            <ion-select-option value="STOOL">Stool</ion-select-option>
            <ion-select-option value="SWAB">Swab</ion-select-option>
            <ion-select-option value="OTHER">Other</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input label="Price *" labelPlacement="stacked" type="number" formControlName="price" placeholder="0.00"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Turnaround (hours)" labelPlacement="stacked" type="number" formControlName="turnaroundHours" placeholder="e.g. 4"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Reference Range" labelPlacement="stacked" formControlName="referenceRange" placeholder="e.g. 70-100 mg/dL"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Unit" labelPlacement="stacked" formControlName="unit" placeholder="e.g. mg/dL"></ion-input>
        </ion-item>

        <ion-button expand="block" class="ion-margin-top" [disabled]="form.invalid || submitting" (click)="submit()">
          <ion-icon name="save-outline" slot="start"></ion-icon>
          {{ submitting ? 'Saving...' : (isEdit ? 'Update Test' : 'Create Test') }}
        </ion-button>
      </form>
    </ion-content>
  `
})
export class CatalogueFormPage implements OnInit {
  form = this.fb.group({
    testCode: ['', Validators.required],
    testName: ['', Validators.required],
    category: [''],
    description: [''],
    sampleType: ['BLOOD', Validators.required],
    price: [null as number | null, Validators.required],
    turnaroundHours: [null as number | null],
    referenceRange: [''],
    unit: ['']
  });

  isEdit = false;
  editId = 0;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private labService: LabService
  ) {
    addIcons({ saveOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.loading = true;
      this.labService.getCatalogueById(this.editId).subscribe({
        next: res => {
          const t = res.data;
          this.form.patchValue({
            testCode: t.testCode,
            testName: t.testName,
            category: t.category,
            description: t.description,
            sampleType: t.sampleType,
            price: t.price,
            turnaroundHours: t.turnaroundHours,
            referenceRange: t.referenceRange,
            unit: t.unit
          });
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    const val = this.form.value;
    const req = {
      testCode: val.testCode!,
      testName: val.testName!,
      category: val.category || undefined,
      description: val.description || undefined,
      sampleType: val.sampleType!,
      price: val.price!,
      turnaroundHours: val.turnaroundHours || undefined,
      referenceRange: val.referenceRange || undefined,
      unit: val.unit || undefined
    };

    const obs = this.isEdit
      ? this.labService.updateCatalogue(this.editId, req)
      : this.labService.createCatalogue(req);

    obs.subscribe({
      next: () => { this.submitting = false; this.router.navigate(['/lab/catalogue']); },
      error: () => { this.submitting = false; }
    });
  }
}
