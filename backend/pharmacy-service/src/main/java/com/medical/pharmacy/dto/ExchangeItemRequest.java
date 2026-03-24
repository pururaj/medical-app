package com.medical.pharmacy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExchangeItemRequest {

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String medicineUnit;

    @NotNull @Min(1)
    private Integer quantity;

    @NotNull
    private BigDecimal unitPrice;
}
