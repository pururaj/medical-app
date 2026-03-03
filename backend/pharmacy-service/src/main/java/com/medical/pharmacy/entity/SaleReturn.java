package com.medical.pharmacy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale_returns", indexes = {
        @Index(name = "idx_return_number", columnList = "return_number")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "return_number", unique = true, length = 30)
    private String returnNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_sale_id", nullable = false)
    private Sale originalSale;

    @Column(name = "return_reason", columnDefinition = "TEXT")
    private String returnReason;

    @Column(name = "total_refund_amount", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalRefundAmount = BigDecimal.ZERO;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    @OneToMany(mappedBy = "saleReturn", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @Builder.Default
    private List<SaleReturnItem> returnItems = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
