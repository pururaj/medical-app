import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ScannedMedicineDto {
  name?: string;
  genericName?: string;
  manufacturer?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  barcode?: string;
}

export interface BillScanResponse {
  medicines: ScannedMedicineDto[];
  rawResponse?: string;
}

export interface BulkCreateRequest {
  medicines: ScannedMedicineDto[];
  performedBy?: string;
}

export interface MedicineDto {
  id: number;
  name: string;
  genericName?: string;
  barcode?: string;
  category: string;
  manufacturer?: string;
  description?: string;
  unit: string;
  unitPrice: number;
  reorderLevel: number;
  active: boolean;
  totalStock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicineRequest {
  name: string;
  genericName?: string;
  category: string;
  manufacturer?: string;
  description?: string;
  unit: string;
  unitPrice: number;
  reorderLevel?: number;
  barcode?: string;
}

export interface UpdateMedicineRequest {
  name?: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  unit?: string;
  unitPrice?: number;
  reorderLevel?: number;
  active?: boolean;
}

export interface InventoryStockDto {
  id: number;
  medicineId: number;
  medicineName: string;
  medicineCategory: string;
  batchNumber?: string;
  currentQuantity: number;
  expiryDate?: string;
  supplier?: string;
  receivedDate?: string;
  location?: string;
  createdAt?: string;
}

export interface StockAdjustmentRequest {
  medicineId: number;
  transactionType: string;
  quantity: number;
  notes?: string;
  batchNumber?: string;
  supplier?: string;
  location?: string;
  expiryDate?: string;
  performedBy?: string;
}

export interface StockTransactionDto {
  id: number;
  medicineId: number;
  medicineName: string;
  transactionType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

export interface InventorySummaryDto {
  totalMedicines: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  totalStockItems: number;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly BASE_URL = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getMedicines(search?: string, category?: string, page = 0, size = 50): Observable<ApiResponse<PageResponse<MedicineDto>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<PageResponse<MedicineDto>>>(`${this.BASE_URL}/medicines`, { params });
  }

  getMedicineById(id: number): Observable<ApiResponse<MedicineDto>> {
    return this.http.get<ApiResponse<MedicineDto>>(`${this.BASE_URL}/medicines/${id}`);
  }

  createMedicine(req: CreateMedicineRequest): Observable<ApiResponse<MedicineDto>> {
    return this.http.post<ApiResponse<MedicineDto>>(`${this.BASE_URL}/medicines`, req);
  }

  updateMedicine(id: number, req: UpdateMedicineRequest): Observable<ApiResponse<MedicineDto>> {
    return this.http.put<ApiResponse<MedicineDto>>(`${this.BASE_URL}/medicines/${id}`, req);
  }

  deleteMedicine(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.BASE_URL}/medicines/${id}`);
  }

  getSummary(): Observable<ApiResponse<InventorySummaryDto>> {
    return this.http.get<ApiResponse<InventorySummaryDto>>(`${this.BASE_URL}/summary`);
  }

  getAllStock(page = 0, size = 50): Observable<ApiResponse<PageResponse<InventoryStockDto>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<InventoryStockDto>>>(`${this.BASE_URL}/stock`, { params });
  }

  getLowStock(): Observable<ApiResponse<MedicineDto[]>> {
    return this.http.get<ApiResponse<MedicineDto[]>>(`${this.BASE_URL}/stock/low-stock`);
  }

  getStockForMedicine(medicineId: number): Observable<ApiResponse<InventoryStockDto[]>> {
    return this.http.get<ApiResponse<InventoryStockDto[]>>(`${this.BASE_URL}/stock/medicine/${medicineId}`);
  }

  adjustStock(req: StockAdjustmentRequest): Observable<ApiResponse<StockTransactionDto>> {
    return this.http.post<ApiResponse<StockTransactionDto>>(`${this.BASE_URL}/stock/adjust`, req);
  }

  getTransactions(medicineId: number): Observable<ApiResponse<StockTransactionDto[]>> {
    return this.http.get<ApiResponse<StockTransactionDto[]>>(`${this.BASE_URL}/transactions/medicine/${medicineId}`);
  }

  scanBill(image: File): Observable<ApiResponse<BillScanResponse>> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<ApiResponse<BillScanResponse>>(`${this.BASE_URL}/medicines/scan-bill`, formData);
  }

  scanBarcode(barcode: string): Observable<ApiResponse<ScannedMedicineDto>> {
    return this.http.post<ApiResponse<ScannedMedicineDto>>(`${this.BASE_URL}/medicines/scan-barcode`, { barcode });
  }

  scanLabel(image: File): Observable<ApiResponse<ScannedMedicineDto>> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<ApiResponse<ScannedMedicineDto>>(`${this.BASE_URL}/medicines/scan-label`, formData);
  }

  bulkCreate(req: BulkCreateRequest): Observable<ApiResponse<MedicineDto[]>> {
    return this.http.post<ApiResponse<MedicineDto[]>>(`${this.BASE_URL}/medicines/bulk`, req);
  }
}
