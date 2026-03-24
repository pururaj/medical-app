package com.medical.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScannedMedicineDto {
    private String name;
    private String genericName;
    private String manufacturer;
    private String category;
    private String unit;
    private int quantity;
    private BigDecimal unitPrice;
    private String barcode;
}
