package com.medical.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstMonthlySummaryDto {

    private int year;
    private int month;

    // Purchase (Input Tax Credit)
    private BigDecimal purchaseTaxableAmount;
    private BigDecimal purchaseCgst;
    private BigDecimal purchaseSgst;
    private BigDecimal purchaseIgst;
    private BigDecimal purchaseTotalTax;
    private BigDecimal purchaseTotalAmount;
    private long purchaseInvoiceCount;

    // Sales (Output Tax)
    private BigDecimal saleTaxableAmount;
    private BigDecimal saleCgst;
    private BigDecimal saleSgst;
    private BigDecimal saleIgst;
    private BigDecimal saleTotalTax;
    private BigDecimal saleTotalAmount;
    private long saleInvoiceCount;

    // Net ITC position (purchase tax - sale tax)
    private BigDecimal netItcCgst;
    private BigDecimal netItcSgst;
    private BigDecimal netItcIgst;
    private BigDecimal netItcTotal;
}
