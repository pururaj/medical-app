import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonList, IonItem, IonLabel, IonIcon, IonSearchbar,
  IonItemSliding, IonItemOptions, IonItemOption,
  IonFab, IonFabButton, IonSpinner, IonBackButton,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, createOutline, trashOutline, addOutline, phonePortraitOutline } from 'ionicons/icons';
import { PharmacyService, CustomerDto } from '../../../../core/services/pharmacy.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: 'customer-list.page.html',
  styleUrls: ['customer-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonList, IonItem, IonLabel, IonIcon, IonSearchbar,
    IonItemSliding, IonItemOptions, IonItemOption,
    IonFab, IonFabButton, IonSpinner, IonBackButton
  ]
})
export class CustomerListPage implements OnInit {
  customers: CustomerDto[] = [];
  loading = true;

  constructor(
    private pharmacyService: PharmacyService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ personOutline, createOutline, trashOutline, addOutline, phonePortraitOutline });
  }

  ngOnInit() { this.loadCustomers(); }

  loadCustomers(keyword?: string) {
    this.loading = true;
    this.pharmacyService.getCustomers(keyword, 0, 50).subscribe({
      next: res => { this.customers = res.data?.content ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(event: any) {
    this.loadCustomers(event.detail.value || undefined);
  }

  editCustomer(customer: CustomerDto, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/pharmacy/customers', customer.id, 'edit']);
  }

  async deleteCustomer(customer: CustomerDto, slidingItem: IonItemSliding) {
    slidingItem.close();
    const alert = await this.alertCtrl.create({
      header: 'Delete Customer',
      message: `Remove ${customer.name}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive',
          handler: () => {
            this.pharmacyService.deleteCustomer(customer.id).subscribe({
              next: async () => {
                this.customers = this.customers.filter(c => c.id !== customer.id);
                const toast = await this.toastCtrl.create({ message: 'Customer removed', duration: 2000, color: 'success' });
                toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  addCustomer() {
    this.router.navigate(['/pharmacy/customers/new']);
  }
}
