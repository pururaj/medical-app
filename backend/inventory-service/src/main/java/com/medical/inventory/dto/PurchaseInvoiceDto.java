package com.medical.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseInvoiceDto {
    private Long id;
    private String invoiceNumber;
    private String supplierName;
    private String supplierGstin;
    private LocalDate invoiceDate;
    private BigDecimal taxableAmount;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal totalAmount;
    private String notes;
    private String createdBy;
    private List<PurchaseInvoiceItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
