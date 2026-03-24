package com.medical.lab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateResultRequest {

    @NotNull
    private Long labOrderItemId;

    @NotBlank
    private String resultValue;

    private String unit;
    private String referenceRange;
    private Boolean isAbnormal = false;
    private String remarks;
    private String enteredBy;
}
