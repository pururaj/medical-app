package com.medical.inventory.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedicineDto {
    private Long id;
    private String name;
    private String genericName;
    private String category;
    private String manufacturer;
    private String description;
    private String unit;
    private BigDecimal unitPrice;
    private Integer reorderLevel;
    private Boolean active;
    private Integer totalStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
