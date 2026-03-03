package com.medical.inventory.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateMedicineRequest {
    private String name;
    private String genericName;
    private String category;
    private String manufacturer;
    private String description;
    private String unit;
    private BigDecimal unitPrice;
    private Integer reorderLevel;
    private Boolean active;
}
