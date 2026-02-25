package com.medical.appointment.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleDto {

    private Long id;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String doctorName;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Min(value = 15, message = "Slot duration must be at least 15 minutes")
    @Max(value = 60, message = "Slot duration cannot exceed 60 minutes")
    private Integer slotDurationMinutes;

    @Min(value = 1, message = "At least 1 patient per slot required")
    private Integer maxPatientsPerSlot;

    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private Boolean active;
    private LocalDate effectiveFrom;
    private LocalDate effectiveUntil;
}
