package com.medical.pharmacy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateSaleRequest {
    private Long customerId;
    private String customerName;
    private String customerPhone;

    @NotEmpty(message = "Sale must have at least one item")
    @Valid
    private List<CreateSaleItemRequest> items;

    private BigDecimal discountAmount;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private String notes;
    private String processedBy;
}
