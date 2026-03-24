package com.medical.lab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultDto {
    private Long id;
    private Long labOrderItemId;
    private Long labOrderId;
    private String testCode;
    private String testName;
    private String resultValue;
    private String unit;
    private String referenceRange;
    private Boolean isAbnormal;
    private String remarks;
    private String enteredBy;
    private LocalDateTime createdAt;
}
