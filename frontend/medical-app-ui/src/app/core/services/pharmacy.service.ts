import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicineDto } from './inventory.service';

export interface CustomerDto {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  patientId?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  patientId?: number;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  patientId?: number;
  active?: boolean;
}

export interface SaleItemDto {
  id: number;
  medicineId: number;
  medicineName: string;
  medicineUnit?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CreateSaleItemRequest {
  medicineId: number;
  medicineName: string;
  medicineUnit?: string;
  quantity: number;
  unitPrice: number;
}

export interface CartItem {
  medicine: MedicineDto;
  quantity: number;
  unitPrice: number;
}

export interface SaleDto {
  id: number;
  saleNumber: string;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes?: string;
  processedBy?: string;
  items: SaleItemDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSaleRequest {
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  items: CreateSaleItemRequest[];
  discountAmount?: number;
  paymentMethod: string;
  notes?: string;
  processedBy?: string;
}

export interface SaleReturnItemDto {
  id: number;
  originalSaleItemId?: number;
  medicineId: number;
  medicineName: string;
  quantityReturned: number;
  unitPrice: number;
  refundAmount: number;
}

export interface CreateReturnItemRequest {
  originalSaleItemId?: number;
  medicineId: number;
  medicineName: string;
  quantityReturned: number;
  unitPrice: number;
}

export interface SaleReturnDto {
  id: number;
  returnNumber: string;
  originalSaleId: number;
  originalSaleNumber: string;
  returnReason?: string;
  totalRefundAmount: number;
  processedBy?: string;
  returnItems: SaleReturnItemDto[];
  createdAt: string;
}

export interface CreateReturnRequest {
  originalSaleId: number;
  returnReason?: string;
  processedBy?: string;
  items: CreateReturnItemRequest[];
}

export interface POSSummaryDto {
  todaySalesCount: number;
  todayRevenue: number;
  totalCustomers: number;
  pendingReturnsCount: number;
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
export class PharmacyService {
  private readonly base = `${environment.apiUrl}/pharmacy`;

  constructor(private http: HttpClient) {}

  // Customers
  getCustomers(keyword?: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<CustomerDto>>> {
    const params: Record<string, string | number> = { page, size };
    if (keyword) params['keyword'] = keyword;
    return this.http.get<ApiResponse<PageResponse<CustomerDto>>>(`${this.base}/customers`, { params: params as any });
  }

  getCustomerById(id: number): Observable<ApiResponse<CustomerDto>> {
    return this.http.get<ApiResponse<CustomerDto>>(`${this.base}/customers/${id}`);
  }

  createCustomer(req: CreateCustomerRequest): Observable<ApiResponse<CustomerDto>> {
    return this.http.post<ApiResponse<CustomerDto>>(`${this.base}/customers`, req);
  }

  updateCustomer(id: number, req: UpdateCustomerRequest): Observable<ApiResponse<CustomerDto>> {
    return this.http.put<ApiResponse<CustomerDto>>(`${this.base}/customers/${id}`, req);
  }

  deleteCustomer(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/customers/${id}`);
  }

  // Sales
  getSales(page = 0, size = 20, status?: string, startDate?: string, endDate?: string): Observable<ApiResponse<PageResponse<SaleDto>>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    if (startDate) params['startDate'] = startDate;
    if (endDate) params['endDate'] = endDate;
    return this.http.get<ApiResponse<PageResponse<SaleDto>>>(`${this.base}/sales`, { params: params as any });
  }

  getSaleById(id: number): Observable<ApiResponse<SaleDto>> {
    return this.http.get<ApiResponse<SaleDto>>(`${this.base}/sales/${id}`);
  }

  createSale(req: CreateSaleRequest): Observable<ApiResponse<SaleDto>> {
    return this.http.post<ApiResponse<SaleDto>>(`${this.base}/sales`, req);
  }

  cancelSale(id: number): Observable<ApiResponse<SaleDto>> {
    return this.http.put<ApiResponse<SaleDto>>(`${this.base}/sales/${id}/cancel`, {});
  }

  // Returns
  getReturns(page = 0, size = 20): Observable<ApiResponse<PageResponse<SaleReturnDto>>> {
    return this.http.get<ApiResponse<PageResponse<SaleReturnDto>>>(`${this.base}/returns`, { params: { page, size } as any });
  }

  getReturnById(id: number): Observable<ApiResponse<SaleReturnDto>> {
    return this.http.get<ApiResponse<SaleReturnDto>>(`${this.base}/returns/${id}`);
  }

  createReturn(req: CreateReturnRequest): Observable<ApiResponse<SaleReturnDto>> {
    return this.http.post<ApiResponse<SaleReturnDto>>(`${this.base}/returns`, req);
  }

  // Summary
  getSummary(): Observable<ApiResponse<POSSummaryDto>> {
    return this.http.get<ApiResponse<POSSummaryDto>>(`${this.base}/summary`);
  }
}
