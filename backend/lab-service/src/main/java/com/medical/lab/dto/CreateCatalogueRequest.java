package com.medical.lab.dto;

import com.medical.lab.entity.TestCatalogue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateCatalogueRequest {

    @NotBlank
    private String testCode;

    @NotBlank
    private String testName;

    private String category;
    private String description;

    @NotNull
    private TestCatalogue.SampleType sampleType;

    @NotNull
    private BigDecimal price;

    private Integer turnaroundHours;
    private String referenceRange;
    private String unit;
}
