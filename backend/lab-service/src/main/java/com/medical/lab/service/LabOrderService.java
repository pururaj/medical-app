package com.medical.lab.service;

import com.medical.lab.dto.*;
import com.medical.lab.entity.LabOrder;
import com.medical.lab.entity.LabOrderItem;
import com.medical.lab.entity.TestCatalogue;
import com.medical.lab.repository.LabOrderRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabOrderService {

    private final LabOrderRepository orderRepo;
    private final TestCatalogueService catalogueService;

    @Transactional
    public LabOrderDto createOrder(CreateOrderRequest req) {
        LabOrder order = LabOrder.builder()
                .patientId(req.getPatientId())
                .patientName(req.getPatientName())
                .patientPhone(req.getPatientPhone())
                .doctorName(req.getDoctorName())
                .notes(req.getNotes())
                .processedBy(req.getProcessedBy())
                .build();

        for (CreateOrderItemRequest itemReq : req.getItems()) {
            TestCatalogue catalogue = catalogueService.findById(itemReq.getTestCatalogueId());
            LabOrderItem item = LabOrderItem.builder()
                    .labOrder(order)
                    .testCatalogueId(catalogue.getId())
                    .testCode(catalogue.getTestCode())
                    .testName(catalogue.getTestName())
                    .price(catalogue.getPrice())
                    .build();
            order.getItems().add(item);
        }

        LabOrder saved = orderRepo.save(order);
        String orderNumber = "LAB-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%04d", saved.getId());
        saved.setOrderNumber(orderNumber);
        return toDto(orderRepo.save(saved));
    }

    @Transactional(readOnly = true)
    public PageResponse<LabOrderDto> getOrders(int page, int size, String status, String startDate, String endDate) {
        Specification<LabOrder> spec = Specification.where(null);

        if (status != null && !status.isBlank()) {
            LabOrder.OrderStatus orderStatus = LabOrder.OrderStatus.valueOf(status);
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), orderStatus));
        }
        if (startDate != null && !startDate.isBlank()) {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), start));
        }
        if (endDate != null && !endDate.isBlank()) {
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), end));
        }

        Page<LabOrder> result = orderRepo.findAll(spec,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));

        List<LabOrderDto> content = result.getContent().stream().map(this::toDto).toList();
        return PageResponse.<LabOrderDto>builder()
                .content(content)
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public LabOrderDto getOrderById(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public LabOrderDto collectSample(Long id, CollectSampleRequest req) {
        LabOrder order = findById(id);
        order.setSampleId(req.getSampleId());
        order.setSampleType(req.getSampleType() != null
                ? TestCatalogue.SampleType.valueOf(req.getSampleType()) : null);
        order.setCollectedAt(LocalDateTime.now());
        order.setCollectedBy(req.getCollectedBy());
        order.setStatus(LabOrder.OrderStatus.SAMPLE_COLLECTED);
        return toDto(orderRepo.save(order));
    }

    @Transactional
    public LabOrderDto markInProgress(Long id) {
        LabOrder order = findById(id);
        order.setStatus(LabOrder.OrderStatus.IN_PROGRESS);
        return toDto(orderRepo.save(order));
    }

    @Transactional
    public LabOrderDto completeOrder(Long id) {
        LabOrder order = findById(id);
        order.setStatus(LabOrder.OrderStatus.COMPLETED);
        return toDto(orderRepo.save(order));
    }

    @Transactional
    public LabOrderDto cancelOrder(Long id) {
        LabOrder order = findById(id);
        order.setStatus(LabOrder.OrderStatus.CANCELLED);
        return toDto(orderRepo.save(order));
    }

    public LabOrder findById(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab order not found: " + id));
    }

    public long countItemsForOrder(Long orderId) {
        return findById(orderId).getItems().size();
    }

    private LabOrderDto toDto(LabOrder o) {
        List<LabOrderItemDto> items = o.getItems().stream().map(item -> LabOrderItemDto.builder()
                .id(item.getId())
                .testCatalogueId(item.getTestCatalogueId())
                .testCode(item.getTestCode())
                .testName(item.getTestName())
                .price(item.getPrice())
                .createdAt(item.getCreatedAt())
                .build()).toList();

        return LabOrderDto.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .patientId(o.getPatientId())
                .patientName(o.getPatientName())
                .patientPhone(o.getPatientPhone())
                .doctorName(o.getDoctorName())
                .status(o.getStatus())
                .sampleId(o.getSampleId())
                .sampleType(o.getSampleType() != null ? o.getSampleType().name() : null)
                .collectedAt(o.getCollectedAt())
                .collectedBy(o.getCollectedBy())
                .notes(o.getNotes())
                .processedBy(o.getProcessedBy())
                .items(items)
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
