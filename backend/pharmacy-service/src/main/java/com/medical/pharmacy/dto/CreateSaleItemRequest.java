package com.medical.pharmacy.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateSaleItemRequest {
    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String medicineUnit;

    @NotNull
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull
    @DecimalMin(value = "0.01", message = "Unit price must be positive")
    private BigDecimal unitPrice;
}
