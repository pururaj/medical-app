import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppointmentDto {
  id?: number;
  patientId: number;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId: number;
  doctorName?: string;
  specialization?: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes?: number;
  type: 'NEW_VISIT' | 'FOLLOW_UP' | 'EMERGENCY' | 'TELEMEDICINE';
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  reasonForVisit?: string;
  symptoms?: string;
  tokenNumber?: number;
  consultationFee?: number;
  checkedInAt?: string;
  consultationStartedAt?: string;
  consultationEndedAt?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface TimeSlotDto {
  time: string;
  available: boolean;
  bookedCount: number;
  maxCapacity: number;
}

export interface AppointmentBookingRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  type: 'NEW_VISIT' | 'FOLLOW_UP' | 'EMERGENCY' | 'TELEMEDICINE';
  reasonForVisit?: string;
  symptoms?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Book a new appointment
   */
  bookAppointment(request: AppointmentBookingRequest): Observable<ApiResponse<AppointmentDto>> {
    return this.http.post<ApiResponse<AppointmentDto>>(`${this.baseUrl}/book`, request);
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  getAvailableSlots(doctorId: number, date: string): Observable<ApiResponse<TimeSlotDto[]>> {
    return this.http.get<ApiResponse<TimeSlotDto[]>>(
      `${this.baseUrl}/doctor/${doctorId}/available-slots`,
      { params: { date } }
    );
  }

  /**
   * Get appointment by ID
   */
  getAppointmentById(id: number): Observable<ApiResponse<AppointmentDto>> {
    return this.http.get<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all appointments for a patient
   */
  getPatientAppointments(patientId: number): Observable<ApiResponse<AppointmentDto[]>> {
    return this.http.get<ApiResponse<AppointmentDto[]>>(`${this.baseUrl}/patient/${patientId}`);
  }

  /**
   * Get today's queue for a doctor
   */
  getTodayQueue(doctorId: number): Observable<ApiResponse<AppointmentDto[]>> {
    return this.http.get<ApiResponse<AppointmentDto[]>>(`${this.baseUrl}/doctor/${doctorId}/today`);
  }

  /**
   * Get appointments for a doctor on a specific date
   */
  getDoctorAppointmentsByDate(doctorId: number, date: string): Observable<ApiResponse<AppointmentDto[]>> {
    return this.http.get<ApiResponse<AppointmentDto[]>>(
      `${this.baseUrl}/doctor/${doctorId}/date/${date}`
    );
  }

  /**
   * Check in a patient
   */
  checkIn(id: number): Observable<ApiResponse<AppointmentDto>> {
    return this.http.put<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/check-in`, {});
  }

  /**
   * Start consultation
   */
  startConsultation(id: number): Observable<ApiResponse<AppointmentDto>> {
    return this.http.put<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/start-consultation`, {});
  }

  /**
   * Complete appointment
   */
  completeAppointment(id: number, notes?: string): Observable<ApiResponse<AppointmentDto>> {
    return this.http.put<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/complete`, { notes });
  }

  /**
   * Cancel appointment
   */
  cancelAppointment(id: number, reason: string, cancelledBy: string): Observable<ApiResponse<AppointmentDto>> {
    return this.http.put<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/cancel`, {
      reason,
      cancelledBy
    });
  }

  /**
   * Reschedule appointment
   */
  rescheduleAppointment(id: number, newDate: string, newTime: string): Observable<ApiResponse<AppointmentDto>> {
    return this.http.put<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}/reschedule`, {
      newDate,
      newTime
    });
  }

  /**
   * Update appointment
   */
  updateAppointment(id: number, appointment: Partial<AppointmentDto>): Observable<ApiResponse<AppointmentDto>> {
    return this.http.put<ApiResponse<AppointmentDto>>(`${this.baseUrl}/${id}`, appointment);
  }

  /**
   * Delete appointment
   */
  deleteAppointment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
