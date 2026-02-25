import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  peopleOutline,
  medkitOutline,
  receiptOutline,
  statsChartOutline,
  personCircleOutline
} from 'ionicons/icons';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonText
  ]
})
export class HomePage {
  todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  quickActions: QuickAction[] = [
    {
      label: 'Book Appointment',
      icon: 'calendar-outline',
      route: '/appointments/book',
      color: '#3880ff',
      description: 'Schedule a doctor visit'
    },
    {
      label: 'My Appointments',
      icon: 'receipt-outline',
      route: '/appointments',
      color: '#2dd36f',
      description: 'View all appointments'
    },
    {
      label: 'Patients',
      icon: 'people-outline',
      route: '/patients',
      color: '#ffc409',
      description: 'Manage patient records'
    },
    {
      label: 'My Profile',
      icon: 'person-circle-outline',
      route: '/patients/1',
      color: '#eb445a',
      description: 'View health records'
    }
  ];

  constructor(private router: Router) {
    addIcons({
      calendarOutline,
      peopleOutline,
      medkitOutline,
      receiptOutline,
      statsChartOutline,
      personCircleOutline
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
