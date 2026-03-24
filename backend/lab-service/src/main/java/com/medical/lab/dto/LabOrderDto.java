package com.medical.lab.dto;

import com.medical.lab.entity.LabOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabOrderDto {
    private Long id;
    private String orderNumber;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private String doctorName;
    private LabOrder.OrderStatus status;
    private String sampleId;
    private String sampleType;
    private LocalDateTime collectedAt;
    private String collectedBy;
    private String notes;
    private String processedBy;
    private List<LabOrderItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
