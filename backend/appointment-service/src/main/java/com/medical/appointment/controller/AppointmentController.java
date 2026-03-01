package com.medical.appointment.controller;

import com.medical.appointment.dto.AppointmentBookingRequest;
import com.medical.appointment.dto.AppointmentDto;
import com.medical.appointment.dto.QueueStatusDto;
import com.medical.appointment.dto.TimeSlotDto;
import com.medical.appointment.service.AppointmentService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointment Management", description = "APIs for booking and managing appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    @Operation(summary = "Book a new appointment")
    public ResponseEntity<ApiResponse<AppointmentDto>> bookAppointment(
            @Valid @RequestBody AppointmentBookingRequest request) {
        AppointmentDto appointment = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", appointment));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentDto>> getAppointmentById(@PathVariable Long id) {
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @GetMapping
    @Operation(summary = "Get all appointments with pagination")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDto>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AppointmentDto> appointments = appointmentService.getAllAppointments(page, size);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get appointments by patient ID")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDto>>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AppointmentDto> appointments = appointmentService.getAppointmentsByPatient(patientId, page, size);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get appointments by doctor ID")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDto>>> getAppointmentsByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AppointmentDto> appointments = appointmentService.getAppointmentsByDoctor(doctorId, page, size);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/{id}/queue-status")
    @Operation(summary = "Get live queue status for an appointment")
    public ResponseEntity<ApiResponse<QueueStatusDto>> getQueueStatus(@PathVariable Long id) {
        QueueStatusDto status = appointmentService.getQueueStatus(id);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @GetMapping("/doctor/{doctorId}/today")
    @Operation(summary = "Get today's appointments for doctor (Queue)")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getTodaysAppointmentsForDoctor(
            @PathVariable Long doctorId) {
        List<AppointmentDto> appointments = appointmentService.getTodaysAppointmentsForDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/doctor/{doctorId}/available-slots")
    @Operation(summary = "Get available time slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getAvailableTimeSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TimeSlotDto> slots = appointmentService.getAvailableTimeSlots(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @PutMapping("/{id}/check-in")
    @Operation(summary = "Check-in patient for appointment")
    public ResponseEntity<ApiResponse<AppointmentDto>> checkIn(@PathVariable Long id) {
        AppointmentDto appointment = appointmentService.checkIn(id);
        return ResponseEntity.ok(ApiResponse.success("Patient checked in successfully", appointment));
    }

    @PutMapping("/{id}/start-consultation")
    @Operation(summary = "Start consultation")
    public ResponseEntity<ApiResponse<AppointmentDto>> startConsultation(@PathVariable Long id) {
        AppointmentDto appointment = appointmentService.startConsultation(id);
        return ResponseEntity.ok(ApiResponse.success("Consultation started", appointment));
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "Complete appointment")
    public ResponseEntity<ApiResponse<AppointmentDto>> completeAppointment(@PathVariable Long id) {
        AppointmentDto appointment = appointmentService.completeAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment completed successfully", appointment));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam String cancelledBy) {
        AppointmentDto appointment = appointmentService.cancelAppointment(id, reason, cancelledBy);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", appointment));
    }

    @PutMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule appointment")
    public ResponseEntity<ApiResponse<AppointmentDto>> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime newTime) {
        AppointmentDto appointment = appointmentService.rescheduleAppointment(id, newDate, newTime);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled successfully", appointment));
    }
}
