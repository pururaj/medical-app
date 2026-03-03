package com.medical.pharmacy.service;

import com.medical.pharmacy.dto.*;
import com.medical.pharmacy.entity.*;
import com.medical.pharmacy.repository.SaleRepository;
import com.medical.pharmacy.repository.SaleReturnRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final SaleReturnRepository returnRepo;
    private final SaleRepository saleRepo;
    private final SaleService saleService;

    @Transactional(readOnly = true)
    public PageResponse<SaleReturnDto> getReturns(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SaleReturn> result = returnRepo.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.<SaleReturnDto>builder()
                .content(result.getContent().stream().map(this::toDto).toList())
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .first(result.isFirst())
                .build();
    }

    @Transactional(readOnly = true)
    public SaleReturnDto getReturnById(Long id) {
        SaleReturn r = returnRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SaleReturn", "id", id));
        return toDto(r);
    }

    @Transactional
    public SaleReturnDto createReturn(CreateReturnRequest req) {
        Sale originalSale = saleRepo.findById(req.getOriginalSaleId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", req.getOriginalSaleId()));

        if (originalSale.getStatus() == Sale.SaleStatus.CANCELLED) {
            throw new IllegalStateException("Cannot return a cancelled sale");
        }
        if (originalSale.getStatus() == Sale.SaleStatus.RETURNED) {
            throw new IllegalStateException("This sale has already been fully returned");
        }

        SaleReturn saleReturn = SaleReturn.builder()
                .originalSale(originalSale)
                .returnReason(req.getReturnReason())
                .processedBy(req.getProcessedBy())
                .build();

        List<SaleReturnItem> returnItems = req.getItems().stream().map(i -> {
            BigDecimal refund = i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantityReturned()));
            return SaleReturnItem.builder()
                    .saleReturn(saleReturn)
                    .originalSaleItemId(i.getOriginalSaleItemId())
                    .medicineId(i.getMedicineId())
                    .medicineName(i.getMedicineName())
                    .quantityReturned(i.getQuantityReturned())
                    .unitPrice(i.getUnitPrice())
                    .refundAmount(refund)
                    .build();
        }).toList();

        BigDecimal totalRefund = returnItems.stream()
                .map(SaleReturnItem::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        saleReturn.setTotalRefundAmount(totalRefund);
        saleReturn.getReturnItems().addAll(returnItems);

        SaleReturn saved = returnRepo.save(saleReturn);

        // Generate return number
        String returnNumber = "RET-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%04d", saved.getId());
        saved.setReturnNumber(returnNumber);
        saved = returnRepo.save(saved);

        // Update original sale status
        long totalReturns = returnRepo.countByOriginalSaleId(originalSale.getId());
        // Simple heuristic: if any return exists, mark as PARTIALLY_RETURNED; full return logic can be enhanced later
        if (originalSale.getStatus() != Sale.SaleStatus.RETURNED) {
            originalSale.setStatus(Sale.SaleStatus.PARTIALLY_RETURNED);
            saleRepo.save(originalSale);
        }

        return toDto(saved);
    }

    private SaleReturnDto toDto(SaleReturn r) {
        return SaleReturnDto.builder()
                .id(r.getId())
                .returnNumber(r.getReturnNumber())
                .originalSaleId(r.getOriginalSale().getId())
                .originalSaleNumber(r.getOriginalSale().getSaleNumber())
                .returnReason(r.getReturnReason())
                .totalRefundAmount(r.getTotalRefundAmount())
                .processedBy(r.getProcessedBy())
                .returnItems(r.getReturnItems().stream().map(this::toItemDto).toList())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private SaleReturnItemDto toItemDto(SaleReturnItem i) {
        return SaleReturnItemDto.builder()
                .id(i.getId())
                .originalSaleItemId(i.getOriginalSaleItemId())
                .medicineId(i.getMedicineId())
                .medicineName(i.getMedicineName())
                .quantityReturned(i.getQuantityReturned())
                .unitPrice(i.getUnitPrice())
                .refundAmount(i.getRefundAmount())
                .build();
    }
}
