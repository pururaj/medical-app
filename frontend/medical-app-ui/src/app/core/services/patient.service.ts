import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PatientDto {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;   // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type Relationship = 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'GRANDPARENT' | 'GRANDCHILD' | 'OTHER';

export interface FamilyMemberDto {
  id?: number;
  primaryPatientId?: number;
  memberPatient?: PatientDto;
  memberPatientId?: number;
  relationship: Relationship;
  createdAt?: string;
}

export interface AddFamilyMemberRequest {
  memberPatientId?: number;
  newMember?: PatientDto;
  relationship: Relationship;
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
export class PatientService {
  private baseUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  // ---- Patient CRUD ----

  createPatient(patient: PatientDto): Observable<ApiResponse<PatientDto>> {
    return this.http.post<ApiResponse<PatientDto>>(this.baseUrl, patient);
  }

  getPatientById(id: number): Observable<ApiResponse<PatientDto>> {
    return this.http.get<ApiResponse<PatientDto>>(`${this.baseUrl}/${id}`);
  }

  getAllPatients(page = 0, size = 20): Observable<ApiResponse<PageResponse<PatientDto>>> {
    return this.http.get<ApiResponse<PageResponse<PatientDto>>>(
      `${this.baseUrl}?page=${page}&size=${size}&sortBy=createdAt&sortDirection=desc`
    );
  }

  searchPatients(keyword: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<PatientDto>>> {
    return this.http.get<ApiResponse<PageResponse<PatientDto>>>(
      `${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
  }

  updatePatient(id: number, patient: PatientDto): Observable<ApiResponse<PatientDto>> {
    return this.http.put<ApiResponse<PatientDto>>(`${this.baseUrl}/${id}`, patient);
  }

  deletePatient(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // ---- Family Members ----

  getFamilyMembers(patientId: number): Observable<ApiResponse<FamilyMemberDto[]>> {
    return this.http.get<ApiResponse<FamilyMemberDto[]>>(`${this.baseUrl}/${patientId}/family-members`);
  }

  addFamilyMember(patientId: number, request: AddFamilyMemberRequest): Observable<ApiResponse<FamilyMemberDto>> {
    return this.http.post<ApiResponse<FamilyMemberDto>>(`${this.baseUrl}/${patientId}/family-members`, request);
  }

  removeFamilyMember(patientId: number, memberId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${patientId}/family-members/${memberId}`);
  }
}
