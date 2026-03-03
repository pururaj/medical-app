package com.medical.pharmacy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateReturnRequest {
    @NotNull(message = "Original sale ID is required")
    private Long originalSaleId;

    private String returnReason;
    private String processedBy;

    @NotEmpty(message = "Return must have at least one item")
    @Valid
    private List<CreateReturnItemRequest> items;
}
