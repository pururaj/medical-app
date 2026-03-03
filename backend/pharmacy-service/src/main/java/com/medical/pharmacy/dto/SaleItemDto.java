package com.medical.pharmacy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SaleItemDto {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineUnit;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
