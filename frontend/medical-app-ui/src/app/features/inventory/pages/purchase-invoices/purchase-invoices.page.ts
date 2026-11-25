import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonSpinner, IonText, IonIcon, IonSearchbar, IonItem, IonLabel,
  IonModal, IonInput, IonDatetime, IonDatetimeButton, IonChip,
  IonList, IonInfiniteScroll, IonInfiniteScrollContent,
  ModalController, ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, arrowBackOutline, receiptOutline, chevronDownOutline,
  chevronUpOutline, trashOutline, closeOutline,
  homeOutline
} from 'ionicons/icons';
import {
  InventoryService, PurchaseInvoiceDto, CreatePurchaseInvoiceRequest, MedicineDto
} from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-purchase-invoices',
  templateUrl: 'purchase-invoices.page.html',
  styleUrls: ['purchase-invoices.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, FormsModule, ReactiveFormsModule, DatePipe, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonSpinner, IonText, IonIcon, IonSearchbar, IonItem, IonLabel,
    IonModal, IonInput, IonDatetime, IonDatetimeButton, IonChip,
    IonList, IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class PurchaseInvoicesPage implements OnInit {
  loading = false;
  saving = false;
  invoices: PurchaseInvoiceDto[] = [];
  expandedId: number | null = null;
  showForm = false;

  supplierFilter = '';
  page = 0;
  hasMore = true;

  form: FormGroup;
  medicines: MedicineDto[] = [];
  readonly GST_RATES = [0, 5, 12, 18, 28];

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ homeOutline, addOutline, arrowBackOutline, receiptOutline, chevronDownOutline, chevronUpOutline, trashOutline, closeOutline });
    this.form = this.fb.group({
      invoiceNumber: ['', Validators.required],
      supplierName: ['', Validators.required],
      supplierGstin: [''],
      invoiceDate: [new Date().toISOString().substring(0, 10), Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadInvoices();
    this.loadMedicines();
  }

  get itemsArray(): FormArray { return this.form.get('items') as FormArray; }

  addItem() {
    this.itemsArray.push(this.fb.group({
      medicineId: [null, Validators.required],
      medicineName: ['', Validators.required],
      hsnCode: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      gstRate: [12],
      intraState: [true]
    }));
  }

  removeItem(i: number) { this.itemsArray.removeAt(i); }

  onMedicineSelect(index: number, event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const med = this.medicines.find(m => m.id === id);
    if (med) {
      this.itemsArray.at(index).patchValue({
        medicineId: med.id,
        medicineName: med.name,
        hsnCode: med.hsnCode ?? '',
        unitPrice: med.unitPrice,
        gstRate: med.gstRate ?? 12
      });
    }
  }

  itemLineTotal(index: number): number {
    const item = this.itemsArray.at(index).value;
    const taxable = (item.unitPrice ?? 0) * (item.quantity ?? 0);
    const gst = taxable * (item.gstRate ?? 12) / 100;
    return taxable + gst;
  }

  loadInvoices(reset = true) {
    if (reset) { this.page = 0; this.invoices = []; this.hasMore = true; }
    this.loading = true;
    this.inventoryService.getPurchaseInvoices(this.supplierFilter || undefined, undefined, undefined, this.page, 20).subscribe({
      next: res => {
        this.invoices = reset ? res.data.content : [...this.invoices, ...res.data.content];
        this.hasMore = !res.data.last;
        this.loading = false;
      },
      error: () => { this.loading = false; this.showToast('Failed to load invoices', 'danger'); }
    });
  }

  loadMore(event: any) {
    this.page++;
    this.inventoryService.getPurchaseInvoices(this.supplierFilter || undefined, undefined, undefined, this.page, 20).subscribe({
      next: res => {
        this.invoices = [...this.invoices, ...res.data.content];
        this.hasMore = !res.data.last;
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  private loadMedicines() {
    this.inventoryService.getMedicines(undefined, undefined, 0, 500).subscribe({
      next: res => { this.medicines = res.data.content; }
    });
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  openForm() {
    this.form.reset({ invoiceDate: new Date().toISOString().substring(0, 10) });
    this.itemsArray.clear();
    this.addItem();
    this.showForm = true;
  }

  closeForm() { this.showForm = false; }

  async submit() {
    if (this.form.invalid || this.itemsArray.length === 0) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }
    this.saving = true;
    const req: CreatePurchaseInvoiceRequest = {
      ...this.form.value,
      items: this.itemsArray.value
    };
    this.inventoryService.createPurchaseInvoice(req).subscribe({
      next: res => {
        this.invoices.unshift(res.data);
        this.showForm = false;
        this.saving = false;
        this.showToast('Invoice saved successfully', 'success');
      },
      error: err => {
        this.saving = false;
        this.showToast(err?.error?.message ?? 'Failed to save invoice', 'danger');
      }
    });
  }

  goBack() { this.router.navigate(['/inventory/gst-summary']); }

  private async showToast(msg: string, color = 'primary') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, color });
    await t.present();
  }
}
