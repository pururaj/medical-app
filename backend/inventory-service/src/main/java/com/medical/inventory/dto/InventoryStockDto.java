package com.medical.inventory.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InventoryStockDto {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCategory;
    private String batchNumber;
    private Integer currentQuantity;
    private LocalDate expiryDate;
    private String supplier;
    private LocalDate receivedDate;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
