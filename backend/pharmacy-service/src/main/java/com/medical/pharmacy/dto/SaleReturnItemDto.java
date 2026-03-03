package com.medical.pharmacy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SaleReturnItemDto {
    private Long id;
    private Long originalSaleItemId;
    private Long medicineId;
    private String medicineName;
    private Integer quantityReturned;
    private BigDecimal unitPrice;
    private BigDecimal refundAmount;
}
