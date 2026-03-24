package com.medical.lab.dto;

import com.medical.lab.entity.TestCatalogue;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateCatalogueRequest {
    private String testName;
    private String category;
    private String description;
    private TestCatalogue.SampleType sampleType;
    private BigDecimal price;
    private Integer turnaroundHours;
    private String referenceRange;
    private String unit;
    private Boolean active;
}
