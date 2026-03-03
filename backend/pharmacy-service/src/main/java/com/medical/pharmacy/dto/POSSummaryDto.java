package com.medical.pharmacy.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class POSSummaryDto {
    private long todaySalesCount;
    private BigDecimal todayRevenue;
    private long totalCustomers;
    private long pendingReturnsCount;
}
