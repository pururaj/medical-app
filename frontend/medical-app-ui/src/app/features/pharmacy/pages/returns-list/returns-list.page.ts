import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonList, IonItem, IonLabel, IonIcon, IonSpinner, IonBackButton,
  IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { returnDownBackOutline } from 'ionicons/icons';
import { PharmacyService, SaleReturnDto } from '../../../../core/services/pharmacy.service';

@Component({
  selector: 'app-returns-list',
  templateUrl: 'returns-list.page.html',
  styleUrls: ['returns-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonList, IonItem, IonLabel, IonIcon, IonSpinner, IonBackButton,
    IonRefresher, IonRefresherContent
  ]
})
export class ReturnsListPage implements OnInit {
  returns: SaleReturnDto[] = [];
  loading = true;

  constructor(private pharmacyService: PharmacyService, private router: Router) {
    addIcons({ returnDownBackOutline });
  }

  ngOnInit() { this.loadReturns(); }

  loadReturns(event?: any) {
    this.loading = true;
    this.pharmacyService.getReturns(0, 50).subscribe({
      next: res => {
        this.returns = res.data?.content ?? [];
        this.loading = false;
        event?.target?.complete();
      },
      error: () => { this.loading = false; event?.target?.complete(); }
    });
  }

  viewReturn(r: SaleReturnDto) {
    this.router.navigate(['/pharmacy/history', r.originalSaleId]);
  }
}
