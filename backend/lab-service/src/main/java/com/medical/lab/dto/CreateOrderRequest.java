package com.medical.lab.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull
    private Long patientId;

    @NotBlank
    private String patientName;

    private String patientPhone;
    private String doctorName;
    private String notes;
    private String processedBy;

    @NotEmpty
    @Valid
    private List<CreateOrderItemRequest> items;
}
