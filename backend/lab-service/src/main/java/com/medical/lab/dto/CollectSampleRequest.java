package com.medical.lab.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CollectSampleRequest {

    @NotBlank
    private String sampleId;

    private String sampleType;

    @NotBlank
    private String collectedBy;
}
