package com.medical.appointment.dto;

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
public class TimeSlotDto {

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer availableSlots;
    private Integer bookedSlots;
    private Boolean available;
}
