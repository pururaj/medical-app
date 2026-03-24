package com.medical.lab.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_orders", indexes = {
        @Index(name = "idx_lo_order_number", columnList = "order_number", unique = true),
        @Index(name = "idx_lo_patient_id", columnList = "patient_id"),
        @Index(name = "idx_lo_status", columnList = "status"),
        @Index(name = "idx_lo_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, length = 30)
    private String orderNumber;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "patient_name", nullable = false, length = 200)
    private String patientName;

    @Column(name = "patient_phone", length = 20)
    private String patientPhone;

    @Column(name = "doctor_name", length = 200)
    private String doctorName;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "sample_id", length = 100)
    private String sampleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sample_type", length = 20)
    private TestCatalogue.SampleType sampleType;

    @Column(name = "collected_at")
    private LocalDateTime collectedAt;

    @Column(name = "collected_by", length = 100)
    private String collectedBy;

    @Column(length = 500)
    private String notes;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    @Builder.Default
    @OneToMany(mappedBy = "labOrder", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<LabOrderItem> items = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING, SAMPLE_COLLECTED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
