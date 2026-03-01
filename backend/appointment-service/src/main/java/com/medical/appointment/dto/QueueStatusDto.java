package com.medical.appointment.dto;

import com.medical.appointment.entity.Appointment.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueStatusDto {

    private Long appointmentId;
    private Integer tokenNumber;
    private AppointmentStatus status;

    // 1+ = position in active queue; 0 = in progress or terminal; -1 = not checked in yet
    private int positionInQueue;

    // Number of CHECKED_IN patients with a lower token number
    private int patientsAhead;

    // Token number currently being served (IN_PROGRESS patient), null if none
    private Integer currentlyServingToken;

    // Estimated minutes until this patient is seen
    private int estimatedWaitMinutes;

    // Human-readable status message for the UI
    private String message;
}
