package com.medical.pharmacy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SaleDto {
    private Long id;
    private String saleNumber;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private BigDecimal subtotalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String status;
    private String notes;
    private String processedBy;
    private List<SaleItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
