package com.medical.appointment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments", indexes = {
        @Index(name = "idx_patient_id", columnList = "patient_id"),
        @Index(name = "idx_doctor_id", columnList = "doctor_id"),
        @Index(name = "idx_appointment_date", columnList = "appointment_date"),
        @Index(name = "idx_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_name", nullable = false, length = 200)
    private String patientName;

    @Column(name = "patient_phone", length = 20)
    private String patientPhone;

    @Column(name = "patient_email", length = 150)
    private String patientEmail;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "doctor_name", nullable = false, length = 200)
    private String doctorName;

    @Column(name = "specialization", length = 100)
    private String specialization;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private Integer durationMinutes = 30;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AppointmentType type = AppointmentType.NEW_VISIT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "reason_for_visit", columnDefinition = "TEXT")
    private String reasonForVisit;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "token_number")
    private Integer tokenNumber;

    @Column(name = "consultation_fee", precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "consultation_started_at")
    private LocalDateTime consultationStartedAt;

    @Column(name = "consultation_ended_at")
    private LocalDateTime consultationEndedAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_by", length = 100)
    private String cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public enum AppointmentType {
        NEW_VISIT,
        FOLLOW_UP,
        EMERGENCY,
        TELEMEDICINE
    }

    public enum AppointmentStatus {
        SCHEDULED,
        CONFIRMED,
        CHECKED_IN,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        NO_SHOW,
        RESCHEDULED
    }
}
