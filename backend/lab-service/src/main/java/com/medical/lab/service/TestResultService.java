package com.medical.lab.service;

import com.medical.lab.dto.CreateResultRequest;
import com.medical.lab.dto.TestResultDto;
import com.medical.lab.entity.LabOrderItem;
import com.medical.lab.entity.TestResult;
import com.medical.lab.repository.LabOrderItemRepository;
import com.medical.lab.repository.TestResultRepository;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestResultService {

    private final TestResultRepository resultRepo;
    private final LabOrderItemRepository orderItemRepo;
    private final LabOrderService orderService;

    @Transactional(readOnly = true)
    public List<TestResultDto> getResultsByOrderId(Long labOrderId) {
        return resultRepo.findByLabOrderId(labOrderId).stream().map(this::toDto).toList();
    }

    @Transactional
    public TestResultDto createResult(CreateResultRequest req) {
        LabOrderItem item = orderItemRepo.findById(req.getLabOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Lab order item not found: " + req.getLabOrderItemId()));

        TestResult result = TestResult.builder()
                .labOrderItem(item)
                .labOrderId(item.getLabOrder().getId())
                .testCode(item.getTestCode())
                .testName(item.getTestName())
                .resultValue(req.getResultValue())
                .unit(req.getUnit())
                .referenceRange(req.getReferenceRange())
                .isAbnormal(req.getIsAbnormal() != null && req.getIsAbnormal())
                .remarks(req.getRemarks())
                .enteredBy(req.getEnteredBy())
                .build();

        TestResultDto saved = toDto(resultRepo.save(result));

        // Auto-complete the order if all items have results
        Long orderId = item.getLabOrder().getId();
        long totalItems = orderService.countItemsForOrder(orderId);
        long resultCount = resultRepo.countByLabOrderId(orderId);
        if (resultCount >= totalItems) {
            orderService.completeOrder(orderId);
        }

        return saved;
    }

    @Transactional
    public TestResultDto updateResult(Long id, CreateResultRequest req) {
        TestResult result = resultRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test result not found: " + id));

        if (req.getResultValue() != null) result.setResultValue(req.getResultValue());
        if (req.getUnit() != null) result.setUnit(req.getUnit());
        if (req.getReferenceRange() != null) result.setReferenceRange(req.getReferenceRange());
        if (req.getIsAbnormal() != null) result.setIsAbnormal(req.getIsAbnormal());
        if (req.getRemarks() != null) result.setRemarks(req.getRemarks());
        if (req.getEnteredBy() != null) result.setEnteredBy(req.getEnteredBy());

        return toDto(resultRepo.save(result));
    }

    private TestResultDto toDto(TestResult r) {
        return TestResultDto.builder()
                .id(r.getId())
                .labOrderItemId(r.getLabOrderItem().getId())
                .labOrderId(r.getLabOrderId())
                .testCode(r.getTestCode())
                .testName(r.getTestName())
                .resultValue(r.getResultValue())
                .unit(r.getUnit())
                .referenceRange(r.getReferenceRange())
                .isAbnormal(r.getIsAbnormal())
                .remarks(r.getRemarks())
                .enteredBy(r.getEnteredBy())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
