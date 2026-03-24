import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonFab, IonFabButton, IonIcon, IonList, IonItemSliding, IonItem,
  IonLabel, IonItemOptions, IonItemOption, IonBadge, IonSpinner, IonSearchbar, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { LabService, TestCatalogueDto } from '../../../../core/services/lab.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogue-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonFab, IonFabButton, IonIcon, IonList, IonItemSliding, IonItem,
    IonLabel, IonItemOptions, IonItemOption, IonBadge, IonSpinner, IonSearchbar, IonNote
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/lab"></ion-back-button>
        </ion-buttons>
        <ion-title>Test Catalogue</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-searchbar [(ngModel)]="keyword" (ionInput)="load()" placeholder="Search tests..."></ion-searchbar>

      <div *ngIf="loading" class="ion-text-center ion-padding"><ion-spinner></ion-spinner></div>

      <ion-list *ngIf="!loading">
        <ion-item-sliding *ngFor="let test of tests">
          <ion-item>
            <ion-label>
              <h2>{{ test.testName }}</h2>
              <ion-note>{{ test.testCode }} &bull; {{ test.category }}</ion-note>
              <p>₹{{ test.price }} &bull; {{ test.sampleType }}</p>
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="edit(test.id)">
              <ion-icon name="create-outline" slot="icon-only"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="delete(test.id)">
              <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
        <ion-item *ngIf="tests.length === 0">
          <ion-label class="ion-text-center" color="medium">No tests found</ion-label>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/lab/catalogue/new">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class CatalogueListPage implements OnInit {
  tests: TestCatalogueDto[] = [];
  keyword = '';
  loading = false;

  constructor(private labService: LabService, private router: Router) {
    addIcons({ addOutline, createOutline, trashOutline });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.labService.getCatalogues(this.keyword || undefined, 0, 50).subscribe({
      next: res => { this.tests = res.data?.content || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  edit(id: number) { this.router.navigate(['/lab/catalogue', id, 'edit']); }

  delete(id: number) {
    this.labService.deleteCatalogue(id).subscribe({ next: () => this.load() });
  }
}
