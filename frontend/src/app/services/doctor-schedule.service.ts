import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './appointment.service';

export interface DoctorScheduleDto {
  id?: number;
  doctorId: number;
  doctorName: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  maxPatientsPerSlot?: number;
  breakStartTime?: string;
  breakEndTime?: string;
  active?: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorScheduleService {
  private baseUrl = `${environment.apiUrl}/doctor-schedules`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new doctor schedule
   */
  createSchedule(schedule: DoctorScheduleDto): Observable<ApiResponse<DoctorScheduleDto>> {
    return this.http.post<ApiResponse<DoctorScheduleDto>>(this.baseUrl, schedule);
  }

  /**
   * Get schedule by ID
   */
  getScheduleById(id: number): Observable<ApiResponse<DoctorScheduleDto>> {
    return this.http.get<ApiResponse<DoctorScheduleDto>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all schedules for a doctor
   */
  getSchedulesByDoctor(doctorId: number): Observable<ApiResponse<DoctorScheduleDto[]>> {
    return this.http.get<ApiResponse<DoctorScheduleDto[]>>(`${this.baseUrl}/doctor/${doctorId}`);
  }

  /**
   * Update doctor schedule
   */
  updateSchedule(id: number, schedule: DoctorScheduleDto): Observable<ApiResponse<DoctorScheduleDto>> {
    return this.http.put<ApiResponse<DoctorScheduleDto>>(`${this.baseUrl}/${id}`, schedule);
  }

  /**
   * Delete doctor schedule
   */
  deleteSchedule(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
