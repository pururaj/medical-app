package com.medical.pharmacy.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SaleReturnDto {
    private Long id;
    private String returnNumber;
    private Long originalSaleId;
    private String originalSaleNumber;
    private String returnReason;
    private String transactionType;
    private BigDecimal totalRefundAmount;
    private BigDecimal exchangeAmount;
    private BigDecimal netSettlement;
    private String processedBy;
    private List<SaleReturnItemDto> returnItems;
    private List<ExchangeItemDto> exchangeItems;
    private LocalDateTime createdAt;
}
