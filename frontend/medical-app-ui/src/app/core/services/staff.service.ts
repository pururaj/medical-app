import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StaffDto {
  id: number;
  userId: number;
  username: string;
  role: string;
  enabled: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  shift?: string;
  qualification?: string;
  licenseNumber?: string;
  joiningDate?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffRequest {
  username: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  shift?: string;
  qualification?: string;
  licenseNumber?: string;
  joiningDate?: string;
}

export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  shift?: string;
  qualification?: string;
  licenseNumber?: string;
  joiningDate?: string;
  password?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private baseUrl = `${environment.apiUrl}/staff`;

  constructor(private http: HttpClient) {}

  getStaff(
    role?: string,
    keyword?: string,
    page = 0,
    size = 100
  ): Observable<ApiResponse<PageResponse<StaffDto>>> {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (role) params['role'] = role;
    if (keyword) params['keyword'] = keyword;
    return this.http.get<ApiResponse<PageResponse<StaffDto>>>(this.baseUrl, { params });
  }

  getStaffById(id: number): Observable<ApiResponse<StaffDto>> {
    return this.http.get<ApiResponse<StaffDto>>(`${this.baseUrl}/${id}`);
  }

  createStaff(request: CreateStaffRequest): Observable<ApiResponse<StaffDto>> {
    return this.http.post<ApiResponse<StaffDto>>(this.baseUrl, request);
  }

  updateStaff(id: number, request: UpdateStaffRequest): Observable<ApiResponse<StaffDto>> {
    return this.http.put<ApiResponse<StaffDto>>(`${this.baseUrl}/${id}`, request);
  }

  deleteStaff(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: number): Observable<ApiResponse<StaffDto>> {
    return this.http.put<ApiResponse<StaffDto>>(`${this.baseUrl}/${id}/toggle`, {});
  }
}
