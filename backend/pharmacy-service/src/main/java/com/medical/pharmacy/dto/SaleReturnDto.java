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
    private BigDecimal totalRefundAmount;
    private String processedBy;
    private List<SaleReturnItemDto> returnItems;
    private LocalDateTime createdAt;
}
