package com.medical.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateMedicineRequest {

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String genericName;

    @NotBlank(message = "Category is required")
    private String category;

    private String manufacturer;
    private String description;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", message = "Unit price must be non-negative")
    private BigDecimal unitPrice;

    @Min(value = 0, message = "Reorder level must be non-negative")
    private Integer reorderLevel = 10;
}
