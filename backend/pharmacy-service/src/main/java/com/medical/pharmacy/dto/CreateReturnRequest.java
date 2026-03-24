package com.medical.pharmacy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CreateReturnRequest {
    @NotNull(message = "Original sale ID is required")
    private Long originalSaleId;

    private String returnReason;
    private String processedBy;

    /** RETURN = refund only; EXCHANGE = return items + give new items */
    private String transactionType = "RETURN";

    @NotEmpty(message = "Return must have at least one item")
    @Valid
    private List<CreateReturnItemRequest> items;

    /** Items being given to the customer in exchange (only for EXCHANGE type) */
    @Valid
    private List<ExchangeItemRequest> exchangeItems = new ArrayList<>();
}
