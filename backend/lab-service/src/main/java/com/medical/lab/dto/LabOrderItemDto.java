package com.medical.lab.dto;

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
public class LabOrderItemDto {
    private Long id;
    private Long testCatalogueId;
    private String testCode;
    private String testName;
    private BigDecimal price;
    private LocalDateTime createdAt;
}
