package com.medical.pharmacy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateReturnItemRequest {
    private Long originalSaleItemId;

    @NotNull
    private Long medicineId;

    private String medicineName;

    @NotNull
    @Min(value = 1, message = "Return quantity must be at least 1")
    private Integer quantityReturned;

    @NotNull
    private BigDecimal unitPrice;
}
