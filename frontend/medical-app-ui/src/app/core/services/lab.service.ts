import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TestCatalogueDto {
  id: number;
  testCode: string;
  testName: string;
  category: string;
  description: string;
  sampleType: string;
  price: number;
  turnaroundHours: number;
  referenceRange: string;
  unit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogueRequest {
  testCode: string;
  testName: string;
  category?: string;
  description?: string;
  sampleType: string;
  price: number;
  turnaroundHours?: number;
  referenceRange?: string;
  unit?: string;
}

export interface LabOrderItemDto {
  id: number;
  testCatalogueId: number;
  testCode: string;
  testName: string;
  price: number;
  createdAt: string;
}

export interface LabOrderDto {
  id: number;
  orderNumber: string;
  patientId: number;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  status: string;
  sampleId: string;
  sampleType: string;
  collectedAt: string;
  collectedBy: string;
  notes: string;
  processedBy: string;
  items: LabOrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  patientId: number;
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  notes?: string;
  processedBy?: string;
  items: { testCatalogueId: number }[];
}

export interface CollectSampleRequest {
  sampleId: string;
  sampleType?: string;
  collectedBy: string;
}

export interface TestResultDto {
  id: number;
  labOrderItemId: number;
  labOrderId: number;
  testCode: string;
  testName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  remarks: string;
  enteredBy: string;
  createdAt: string;
}

export interface CreateResultRequest {
  labOrderItemId: number;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
  remarks?: string;
  enteredBy?: string;
}

export interface LabDashboardDto {
  todayOrders: number;
  pendingSamples: number;
  inProgress: number;
  completedToday: number;
  abnormalResults: number;
  totalCatalogueTests: number;
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
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class LabService {
  private readonly base = `${environment.apiUrl}/lab`;

  constructor(private http: HttpClient) {}

  // Catalogue
  getCatalogues(keyword?: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<TestCatalogueDto>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<ApiResponse<PageResponse<TestCatalogueDto>>>(`${this.base}/catalogue`, { params });
  }

  getCatalogueById(id: number): Observable<ApiResponse<TestCatalogueDto>> {
    return this.http.get<ApiResponse<TestCatalogueDto>>(`${this.base}/catalogue/${id}`);
  }

  createCatalogue(req: CreateCatalogueRequest): Observable<ApiResponse<TestCatalogueDto>> {
    return this.http.post<ApiResponse<TestCatalogueDto>>(`${this.base}/catalogue`, req);
  }

  updateCatalogue(id: number, req: Partial<CreateCatalogueRequest>): Observable<ApiResponse<TestCatalogueDto>> {
    return this.http.put<ApiResponse<TestCatalogueDto>>(`${this.base}/catalogue/${id}`, req);
  }

  deleteCatalogue(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/catalogue/${id}`);
  }

  // Orders
  getOrders(page = 0, size = 20, status?: string, startDate?: string, endDate?: string): Observable<ApiResponse<PageResponse<LabOrderDto>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<PageResponse<LabOrderDto>>>(`${this.base}/orders`, { params });
  }

  getOrderById(id: number): Observable<ApiResponse<LabOrderDto>> {
    return this.http.get<ApiResponse<LabOrderDto>>(`${this.base}/orders/${id}`);
  }

  createOrder(req: CreateOrderRequest): Observable<ApiResponse<LabOrderDto>> {
    return this.http.post<ApiResponse<LabOrderDto>>(`${this.base}/orders`, req);
  }

  collectSample(id: number, req: CollectSampleRequest): Observable<ApiResponse<LabOrderDto>> {
    return this.http.put<ApiResponse<LabOrderDto>>(`${this.base}/orders/${id}/collect-sample`, req);
  }

  markInProgress(id: number): Observable<ApiResponse<LabOrderDto>> {
    return this.http.put<ApiResponse<LabOrderDto>>(`${this.base}/orders/${id}/in-progress`, {});
  }

  completeOrder(id: number): Observable<ApiResponse<LabOrderDto>> {
    return this.http.put<ApiResponse<LabOrderDto>>(`${this.base}/orders/${id}/complete`, {});
  }

  cancelOrder(id: number): Observable<ApiResponse<LabOrderDto>> {
    return this.http.put<ApiResponse<LabOrderDto>>(`${this.base}/orders/${id}/cancel`, {});
  }

  // Results
  getResultsByOrderId(orderId: number): Observable<ApiResponse<TestResultDto[]>> {
    const params = new HttpParams().set('orderId', orderId);
    return this.http.get<ApiResponse<TestResultDto[]>>(`${this.base}/results`, { params });
  }

  createResult(req: CreateResultRequest): Observable<ApiResponse<TestResultDto>> {
    return this.http.post<ApiResponse<TestResultDto>>(`${this.base}/results`, req);
  }

  updateResult(id: number, req: Partial<CreateResultRequest>): Observable<ApiResponse<TestResultDto>> {
    return this.http.put<ApiResponse<TestResultDto>>(`${this.base}/results/${id}`, req);
  }

  // Dashboard
  getDashboard(): Observable<ApiResponse<LabDashboardDto>> {
    return this.http.get<ApiResponse<LabDashboardDto>>(`${this.base}/dashboard`);
  }
}
