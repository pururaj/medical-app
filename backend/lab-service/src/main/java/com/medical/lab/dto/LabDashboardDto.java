package com.medical.lab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabDashboardDto {
    private long todayOrders;
    private long pendingSamples;
    private long inProgress;
    private long completedToday;
    private long abnormalResults;
    private long totalCatalogueTests;
}
