package com.medical.pharmacy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DayEndReportDto {
    private String date;
    private String generatedAt;

    // Sales summary
    private long totalSalesCount;
    private BigDecimal totalRevenue;

    // Payment breakdown: method -> { count, amount }
    private Map<String, PaymentBreakdownDto> paymentBreakdown;

    // Returns & exchanges
    private long totalReturnsCount;
    private BigDecimal totalRefundAmount;
    private long totalExchangesCount;
    private BigDecimal totalExchangeAmount;

    // Net
    private BigDecimal netRevenue;

    // Analytics
    private List<TopMedicineDto> topMedicines;
    private List<HourlySalesDto> hourlySales;

    @Data
    @Builder
    public static class PaymentBreakdownDto {
        private long count;
        private BigDecimal amount;
    }

    @Data
    @Builder
    public static class TopMedicineDto {
        private String medicineName;
        private long totalQuantity;
        private BigDecimal totalAmount;
    }

    @Data
    @Builder
    public static class HourlySalesDto {
        private int hour;         // 0-23
        private String label;     // e.g. "09:00"
        private long salesCount;
        private BigDecimal revenue;
    }
}
