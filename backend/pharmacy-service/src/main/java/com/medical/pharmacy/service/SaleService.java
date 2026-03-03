package com.medical.pharmacy.service;

import com.medical.pharmacy.dto.*;
import com.medical.pharmacy.entity.*;
import com.medical.pharmacy.repository.CustomerRepository;
import com.medical.pharmacy.repository.SaleRepository;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepo;
    private final CustomerRepository customerRepo;

    @Transactional(readOnly = true)
    public PageResponse<SaleDto> getSales(int page, int size, String status, String startDate, String endDate) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Sale.SaleStatus saleStatus = status != null ? Sale.SaleStatus.valueOf(status) : null;
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end   = endDate   != null ? LocalDateTime.parse(endDate   + "T23:59:59") : null;

        Page<Sale> result = saleRepo.findByFilters(saleStatus, start, end, pageable);
        return PageResponse.<SaleDto>builder()
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
    public SaleDto getSaleById(Long id) {
        return toDto(findSale(id));
    }

    @Transactional
    public SaleDto createSale(CreateSaleRequest req) {
        // Resolve customer info
        Customer customer = null;
        String customerName  = req.getCustomerName();
        String customerPhone = req.getCustomerPhone();
        if (req.getCustomerId() != null) {
            customer = customerRepo.findById(req.getCustomerId()).orElse(null);
            if (customer != null) {
                customerName  = customer.getName();
                customerPhone = customer.getPhone();
            }
        }

        BigDecimal discount = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;

        Sale sale = Sale.builder()
                .customer(customer)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .discountAmount(discount)
                .paymentMethod(Sale.PaymentMethod.valueOf(req.getPaymentMethod()))
                .paymentStatus(Sale.PaymentStatus.PAID)
                .status(Sale.SaleStatus.COMPLETED)
                .notes(req.getNotes())
                .processedBy(req.getProcessedBy())
                .build();

        // Build items and compute subtotal
        List<SaleItem> items = req.getItems().stream().map(i -> {
            SaleItem item = SaleItem.builder()
                    .sale(sale)
                    .medicineId(i.getMedicineId())
                    .medicineName(i.getMedicineName())
                    .medicineUnit(i.getMedicineUnit())
                    .quantity(i.getQuantity())
                    .unitPrice(i.getUnitPrice())
                    .lineTotal(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .build();
            return item;
        }).toList();

        BigDecimal subtotal = items.stream()
                .map(SaleItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = subtotal.subtract(discount).max(BigDecimal.ZERO);

        sale.setSubtotalAmount(subtotal);
        sale.setTotalAmount(total);
        sale.getItems().addAll(items);

        Sale saved = saleRepo.save(sale);

        // Generate sale number after persist (use DB-assigned ID)
        String saleNumber = "SALE-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%04d", saved.getId());
        saved.setSaleNumber(saleNumber);
        return toDto(saleRepo.save(saved));
    }

    @Transactional
    public SaleDto cancelSale(Long id) {
        Sale sale = findSale(id);
        if (sale.getStatus() != Sale.SaleStatus.COMPLETED) {
            throw new IllegalStateException("Only COMPLETED sales can be cancelled");
        }
        sale.setStatus(Sale.SaleStatus.CANCELLED);
        sale.setPaymentStatus(Sale.PaymentStatus.CANCELLED);
        return toDto(saleRepo.save(sale));
    }

    private Sale findSale(Long id) {
        return saleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", id));
    }

    SaleDto toDto(Sale s) {
        return SaleDto.builder()
                .id(s.getId())
                .saleNumber(s.getSaleNumber())
                .customerId(s.getCustomer() != null ? s.getCustomer().getId() : null)
                .customerName(s.getCustomerName())
                .customerPhone(s.getCustomerPhone())
                .subtotalAmount(s.getSubtotalAmount())
                .discountAmount(s.getDiscountAmount())
                .totalAmount(s.getTotalAmount())
                .paymentMethod(s.getPaymentMethod().name())
                .paymentStatus(s.getPaymentStatus().name())
                .status(s.getStatus().name())
                .notes(s.getNotes())
                .processedBy(s.getProcessedBy())
                .items(s.getItems().stream().map(this::toItemDto).toList())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    private SaleItemDto toItemDto(SaleItem i) {
        return SaleItemDto.builder()
                .id(i.getId())
                .medicineId(i.getMedicineId())
                .medicineName(i.getMedicineName())
                .medicineUnit(i.getMedicineUnit())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .lineTotal(i.getLineTotal())
                .build();
    }
}
