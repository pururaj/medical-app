package com.medical.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreatePurchaseInvoiceRequest {

    @NotBlank(message = "Invoice number is required")
    private String invoiceNumber;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    private String supplierGstin;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    private String notes;
    private String createdBy;

    @NotEmpty(message = "At least one item is required")
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        @NotNull(message = "Medicine ID is required")
        private Long medicineId;

        @NotBlank(message = "Medicine name is required")
        private String medicineName;

        private String hsnCode;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        @NotNull(message = "Unit price is required")
        private BigDecimal unitPrice;

        private BigDecimal gstRate = new BigDecimal("12.00");

        // true = intra-state (CGST+SGST), false = inter-state (IGST)
        private boolean intraState = true;
    }
}
