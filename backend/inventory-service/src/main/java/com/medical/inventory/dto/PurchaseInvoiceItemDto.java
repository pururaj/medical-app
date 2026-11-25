package com.medical.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseInvoiceItemDto {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String hsnCode;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal gstRate;
    private BigDecimal taxableAmount;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal lineTotal;
    private LocalDateTime createdAt;
}
