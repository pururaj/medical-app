package com.medical.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_invoice_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private PurchaseInvoice invoice;

    @Column(name = "medicine_id", nullable = false)
    private Long medicineId;

    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @Column(name = "hsn_code", length = 20)
    private String hsnCode;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "gst_rate", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal gstRate = new BigDecimal("12.00");

    @Column(name = "taxable_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "cgst_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(name = "sgst_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(name = "igst_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal igstAmount = BigDecimal.ZERO;

    @Column(name = "line_total", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.taxableAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal halfGst = gstRate.divide(new BigDecimal("200"), 4, java.math.RoundingMode.HALF_UP);
        this.cgstAmount = taxableAmount.multiply(halfGst).setScale(2, java.math.RoundingMode.HALF_UP);
        this.sgstAmount = this.cgstAmount;
        this.igstAmount = BigDecimal.ZERO;
        this.lineTotal = taxableAmount.add(cgstAmount).add(sgstAmount);
    }
}
