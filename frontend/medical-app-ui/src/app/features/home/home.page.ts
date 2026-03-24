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
  IonText,
  IonButton,
  IonButtons,
  IonChip,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  peopleOutline,
  medkitOutline,
  storefrontOutline,
  receiptOutline,
  statsChartOutline,
  personCircleOutline,
  logOutOutline,
  listOutline,
  medicalOutline,
  peopleCircleOutline,
  flaskOutline
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

const ALL_QUICK_ACTIONS: Record<string, QuickAction[]> = {
  ADMIN: [
    { label: 'Book Appointment', icon: 'calendar-outline',       route: '/appointments/book',  color: '#3880ff', description: 'Schedule a doctor visit' },
    { label: 'My Appointments',  icon: 'receipt-outline',        route: '/appointments',       color: '#2dd36f', description: 'View all appointments' },
    { label: 'Patients',         icon: 'people-outline',         route: '/patients',           color: '#ffc409', description: 'Manage patient records' },
    { label: 'Doctor Queue',     icon: 'list-outline',           route: '/appointments/queue', color: '#eb445a', description: "Today's queue dashboard" },
    { label: 'Doctors',          icon: 'medical-outline',        route: '/doctors',            color: '#92949c', description: 'View doctor profiles' },
    { label: 'Staff',            icon: 'people-circle-outline',  route: '/staff',              color: '#5260ff', description: 'Manage medical staff' },
    { label: 'Inventory',        icon: 'medkit-outline',         route: '/inventory',          color: '#eb445a', description: 'Medicines & stock' },
    { label: 'Pharmacy POS',     icon: 'storefront-outline',     route: '/pharmacy',            color: '#3880ff', description: 'Sales & billing' },
    { label: 'Laboratory',       icon: 'flask-outline',          route: '/lab',                 color: '#2dd36f', description: 'Tests & results' },
  ],
  DOCTOR: [
    { label: 'My Appointments', icon: 'receipt-outline', route: '/appointments',       color: '#2dd36f', description: "View today's appointments" },
    { label: 'Doctor Queue',    icon: 'list-outline',     route: '/appointments/queue', color: '#3880ff', description: 'Manage patient queue' },
    { label: 'Patients',        icon: 'people-outline',   route: '/patients/1',         color: '#ffc409', description: 'View patient records' },
    { label: 'Doctors',         icon: 'medical-outline',  route: '/doctors',            color: '#92949c', description: 'View doctor profiles' },
    { label: 'Laboratory',      icon: 'flask-outline',    route: '/lab',                color: '#2dd36f', description: 'Tests & results' },
  ],
  RECEPTIONIST: [
    { label: 'Book Appointment', icon: 'calendar-outline', route: '/appointments/book',  color: '#3880ff', description: 'Schedule a doctor visit' },
    { label: 'Appointments',     icon: 'receipt-outline',  route: '/appointments',       color: '#2dd36f', description: 'View all appointments' },
    { label: 'Patients',         icon: 'people-outline',   route: '/patients',           color: '#ffc409', description: 'Manage patient records' },
    { label: 'Doctor Queue',     icon: 'list-outline',     route: '/appointments/queue', color: '#eb445a', description: "Today's queue dashboard" },
    { label: 'Pharmacy POS',     icon: 'storefront-outline', route: '/pharmacy',           color: '#3880ff', description: 'Sales & billing' },
    { label: 'Laboratory',       icon: 'flask-outline',      route: '/lab',                color: '#2dd36f', description: 'Tests & results' },
  ],
  PHARMACIST: [
    { label: 'Patients',   icon: 'people-outline',  route: '/patients/1', color: '#ffc409', description: 'View patient records' },
    { label: 'Doctors',    icon: 'medical-outline', route: '/doctors',    color: '#92949c', description: 'View doctor profiles' },
    { label: 'Inventory',    icon: 'medkit-outline',     route: '/inventory', color: '#eb445a', description: 'Medicines & stock' },
    { label: 'Pharmacy POS', icon: 'storefront-outline', route: '/pharmacy',  color: '#3880ff', description: 'Sales & billing' },
  ],
  LAB_TECH: [
    { label: 'Patients',    icon: 'people-outline',  route: '/patients/1', color: '#ffc409', description: 'View patient records' },
    { label: 'Doctors',     icon: 'medical-outline', route: '/doctors',    color: '#92949c', description: 'View doctor profiles' },
    { label: 'Laboratory',  icon: 'flask-outline',   route: '/lab',        color: '#2dd36f', description: 'Tests & results' },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  PHARMACIST: 'Pharmacist',
  LAB_TECH: 'Lab Technician',
};

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
    IonText,
    IonButton,
    IonButtons,
    IonChip,
    IonLabel,
  ]
})
export class HomePage {
  todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  constructor(private router: Router, public authService: AuthService) {
    addIcons({
      calendarOutline,
      peopleOutline,
      medkitOutline,
      storefrontOutline,
      receiptOutline,
      statsChartOutline,
      personCircleOutline,
      logOutOutline,
      listOutline,
      medicalOutline,
      peopleCircleOutline,
      flaskOutline,
    });
  }

  get quickActions(): QuickAction[] {
    return ALL_QUICK_ACTIONS[this.authService.getRole()] ?? [];
  }

  get roleLabel(): string {
    return ROLE_LABELS[this.authService.getRole()] ?? this.authService.getRole();
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
  }
}
