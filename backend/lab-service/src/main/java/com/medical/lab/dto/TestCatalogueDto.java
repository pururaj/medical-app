package com.medical.lab.dto;

import com.medical.lab.entity.TestCatalogue;
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
public class TestCatalogueDto {
    private Long id;
    private String testCode;
    private String testName;
    private String category;
    private String description;
    private TestCatalogue.SampleType sampleType;
    private BigDecimal price;
    private Integer turnaroundHours;
    private String referenceRange;
    private String unit;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
