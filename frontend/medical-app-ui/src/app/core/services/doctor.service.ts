import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DoctorDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  specialization: string;
  subSpecialization?: string;
  qualification: string;
  experienceYears: number;
  licenseNumber?: string;
  hospitalName?: string;
  department?: string;
  city?: string;
  state?: string;
  consultationFee: number;
  consultationDurationMinutes: number;
  bio?: string;
  profileImageUrl?: string;
  averageRating?: number;
  totalRatings?: number;
  available: boolean;
  active?: boolean;
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
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private baseUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  getDoctors(page = 0, size = 20): Observable<ApiResponse<PageResponse<DoctorDto>>> {
    return this.http.get<ApiResponse<PageResponse<DoctorDto>>>(
      `${this.baseUrl}?page=${page}&size=${size}`
    );
  }

  searchDoctors(
    specialization?: string,
    city?: string,
    available?: boolean,
    page = 0,
    size = 20
  ): Observable<ApiResponse<PageResponse<DoctorDto>>> {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (specialization) params['specialization'] = specialization;
    if (city) params['city'] = city;
    if (available !== undefined) params['available'] = String(available);
    return this.http.get<ApiResponse<PageResponse<DoctorDto>>>(this.baseUrl, { params });
  }

  getDoctorById(id: number): Observable<ApiResponse<DoctorDto>> {
    return this.http.get<ApiResponse<DoctorDto>>(`${this.baseUrl}/${id}`);
  }

  getSpecializations(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/specializations`);
  }

  getAvailableDoctors(page = 0, size = 20): Observable<ApiResponse<PageResponse<DoctorDto>>> {
    return this.http.get<ApiResponse<PageResponse<DoctorDto>>>(
      `${this.baseUrl}/available?page=${page}&size=${size}`
    );
  }
}
