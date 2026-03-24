package com.medical.lab.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_results", indexes = {
        @Index(name = "idx_tr_lab_order_id", columnList = "lab_order_id"),
        @Index(name = "idx_tr_is_abnormal", columnList = "is_abnormal")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_item_id", nullable = false, unique = true)
    private LabOrderItem labOrderItem;

    @Column(name = "lab_order_id", nullable = false)
    private Long labOrderId;

    @Column(name = "test_code", nullable = false, length = 50)
    private String testCode;

    @Column(name = "test_name", nullable = false, length = 200)
    private String testName;

    @Column(name = "result_value", nullable = false, length = 200)
    private String resultValue;

    @Column(length = 50)
    private String unit;

    @Column(name = "reference_range", length = 200)
    private String referenceRange;

    @Builder.Default
    @Column(name = "is_abnormal", nullable = false)
    private Boolean isAbnormal = false;

    @Column(length = 500)
    private String remarks;

    @Column(name = "entered_by", length = 100)
    private String enteredBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
