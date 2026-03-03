package com.medical.inventory.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StockTransactionDto {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String transactionType;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String notes;
    private String performedBy;
    private LocalDateTime createdAt;
}
