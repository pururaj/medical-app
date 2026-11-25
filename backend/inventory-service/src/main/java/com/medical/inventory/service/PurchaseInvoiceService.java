package com.medical.inventory.service;

import com.medical.inventory.dto.*;
import com.medical.inventory.entity.PurchaseInvoice;
import com.medical.inventory.entity.PurchaseInvoiceItem;
import com.medical.inventory.repository.PurchaseInvoiceRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseInvoiceService {

    private final PurchaseInvoiceRepository invoiceRepo;

    @Transactional
    public PurchaseInvoiceDto createInvoice(CreatePurchaseInvoiceRequest request) {
        if (invoiceRepo.existsByInvoiceNumber(request.getInvoiceNumber())) {
            throw new IllegalArgumentException("Invoice number '" + request.getInvoiceNumber() + "' already exists");
        }

        PurchaseInvoice invoice = PurchaseInvoice.builder()
                .invoiceNumber(request.getInvoiceNumber())
                .supplierName(request.getSupplierName())
                .supplierGstin(request.getSupplierGstin())
                .invoiceDate(request.getInvoiceDate())
                .notes(request.getNotes())
                .createdBy(request.getCreatedBy())
                .build();

        for (CreatePurchaseInvoiceRequest.ItemRequest ir : request.getItems()) {
            BigDecimal gstRate = ir.getGstRate() != null ? ir.getGstRate() : new BigDecimal("12.00");
            BigDecimal taxable = ir.getUnitPrice().multiply(BigDecimal.valueOf(ir.getQuantity()));
            BigDecimal cgst, sgst, igst;
            if (ir.isIntraState()) {
                BigDecimal half = gstRate.divide(new BigDecimal("200"), 4, RoundingMode.HALF_UP);
                cgst = taxable.multiply(half).setScale(2, RoundingMode.HALF_UP);
                sgst = cgst;
                igst = BigDecimal.ZERO;
            } else {
                BigDecimal rate = gstRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                igst = taxable.multiply(rate).setScale(2, RoundingMode.HALF_UP);
                cgst = BigDecimal.ZERO;
                sgst = BigDecimal.ZERO;
            }
            BigDecimal lineTotal = taxable.add(cgst).add(sgst).add(igst);

            PurchaseInvoiceItem item = PurchaseInvoiceItem.builder()
                    .invoice(invoice)
                    .medicineId(ir.getMedicineId())
                    .medicineName(ir.getMedicineName())
                    .hsnCode(ir.getHsnCode())
                    .quantity(ir.getQuantity())
                    .unitPrice(ir.getUnitPrice())
                    .gstRate(gstRate)
                    .taxableAmount(taxable)
                    .cgstAmount(cgst)
                    .sgstAmount(sgst)
                    .igstAmount(igst)
                    .lineTotal(lineTotal)
                    .build();
            invoice.getItems().add(item);
        }

        // Compute invoice-level totals
        BigDecimal totalTaxable = invoice.getItems().stream().map(PurchaseInvoiceItem::getTaxableAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCgst    = invoice.getItems().stream().map(PurchaseInvoiceItem::getCgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSgst    = invoice.getItems().stream().map(PurchaseInvoiceItem::getSgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalIgst    = invoice.getItems().stream().map(PurchaseInvoiceItem::getIgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        invoice.setTaxableAmount(totalTaxable);
        invoice.setCgstAmount(totalCgst);
        invoice.setSgstAmount(totalSgst);
        invoice.setIgstAmount(totalIgst);
        invoice.setTotalAmount(totalTaxable.add(totalCgst).add(totalSgst).add(totalIgst));

        return toDto(invoiceRepo.save(invoice));
    }

    @Transactional(readOnly = true)
    public PurchaseInvoiceDto getInvoice(Long id) {
        return toDto(invoiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase invoice not found: " + id)));
    }

    @Transactional(readOnly = true)
    public PageResponse<PurchaseInvoiceDto> getInvoices(String supplier, LocalDate from, LocalDate to, int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by("invoiceDate").descending());
        Page<PurchaseInvoice> result = invoiceRepo.findByFilters(supplier, from, to, pr);
        return PageResponse.<PurchaseInvoiceDto>builder()
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
    public GstMonthlySummaryDto getPurchaseSummary(int year, int month) {
        List<PurchaseInvoice> invoices = invoiceRepo.findByYearAndMonth(year, month);

        BigDecimal taxable = invoices.stream().map(PurchaseInvoice::getTaxableAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cgst    = invoices.stream().map(PurchaseInvoice::getCgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal sgst    = invoices.stream().map(PurchaseInvoice::getSgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal igst    = invoices.stream().map(PurchaseInvoice::getIgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total   = invoices.stream().map(PurchaseInvoice::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return GstMonthlySummaryDto.builder()
                .year(year)
                .month(month)
                .purchaseTaxableAmount(taxable)
                .purchaseCgst(cgst)
                .purchaseSgst(sgst)
                .purchaseIgst(igst)
                .purchaseTotalTax(cgst.add(sgst).add(igst))
                .purchaseTotalAmount(total)
                .purchaseInvoiceCount(invoices.size())
                .build();
    }

    private PurchaseInvoiceDto toDto(PurchaseInvoice inv) {
        return PurchaseInvoiceDto.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .supplierName(inv.getSupplierName())
                .supplierGstin(inv.getSupplierGstin())
                .invoiceDate(inv.getInvoiceDate())
                .taxableAmount(inv.getTaxableAmount())
                .cgstAmount(inv.getCgstAmount())
                .sgstAmount(inv.getSgstAmount())
                .igstAmount(inv.getIgstAmount())
                .totalAmount(inv.getTotalAmount())
                .notes(inv.getNotes())
                .createdBy(inv.getCreatedBy())
                .items(inv.getItems().stream().map(this::toItemDto).toList())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    private PurchaseInvoiceItemDto toItemDto(PurchaseInvoiceItem i) {
        return PurchaseInvoiceItemDto.builder()
                .id(i.getId())
                .medicineId(i.getMedicineId())
                .medicineName(i.getMedicineName())
                .hsnCode(i.getHsnCode())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .gstRate(i.getGstRate())
                .taxableAmount(i.getTaxableAmount())
                .cgstAmount(i.getCgstAmount())
                .sgstAmount(i.getSgstAmount())
                .igstAmount(i.getIgstAmount())
                .lineTotal(i.getLineTotal())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
