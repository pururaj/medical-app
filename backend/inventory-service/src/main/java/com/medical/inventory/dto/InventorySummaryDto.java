package com.medical.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryDto {
    private long totalMedicines;
    private long lowStockCount;
    private long outOfStockCount;
    private long expiringSoonCount;
    private long totalStockItems;
}
