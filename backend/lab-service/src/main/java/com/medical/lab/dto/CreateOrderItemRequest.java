package com.medical.lab.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderItemRequest {

    @NotNull
    private Long testCatalogueId;
}
