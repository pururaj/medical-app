package com.medical.appointment.dto;

import com.medical.appointment.entity.Appointment;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {

    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String patientName;
    private String patientPhone;
    private String patientEmail;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String doctorName;
    private String specialization;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must be today or in the future")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 180, message = "Duration cannot exceed 180 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Appointment type is required")
    private Appointment.AppointmentType type;

    private Appointment.AppointmentStatus status;

    @Size(max = 500, message = "Reason for visit must not exceed 500 characters")
    private String reasonForVisit;

    @Size(max = 1000, message = "Symptoms must not exceed 1000 characters")
    private String symptoms;

    private Integer tokenNumber;
    private BigDecimal consultationFee;

    private LocalDateTime checkedInAt;
    private LocalDateTime consultationStartedAt;
    private LocalDateTime consultationEndedAt;

    private String cancellationReason;
    private String cancelledBy;
    private LocalDateTime cancelledAt;

    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
}
