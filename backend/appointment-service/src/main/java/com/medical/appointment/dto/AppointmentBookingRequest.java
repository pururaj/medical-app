package com.medical.appointment.dto;

import com.medical.appointment.entity.Appointment;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentBookingRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    private String patientPhone;
    private String patientEmail;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    private String specialization;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must be today or in the future")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    @NotNull(message = "Appointment type is required")
    private Appointment.AppointmentType type;

    @Size(max = 500, message = "Reason for visit must not exceed 500 characters")
    private String reasonForVisit;

    @Size(max = 1000, message = "Symptoms must not exceed 1000 characters")
    private String symptoms;

    private String notes;
}
