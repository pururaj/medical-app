import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-patients-list',
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>Patients</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Patients module — coming soon.</p>
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar]
})
export class PatientsListPage {}
