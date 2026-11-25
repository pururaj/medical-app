package com.medical.inventory.controller;

import com.medical.inventory.dto.*;
import com.medical.inventory.service.PurchaseInvoiceService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/inventory/purchase-invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseInvoiceController {

    private final PurchaseInvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseInvoiceDto>> create(@Valid @RequestBody CreatePurchaseInvoiceRequest request) {
        PurchaseInvoiceDto dto = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase invoice created", dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseInvoiceDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoice(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PurchaseInvoiceDto>>> list(
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getInvoices(supplier, from, to, page, size)));
    }

    @GetMapping("/gst-summary")
    public ResponseEntity<ApiResponse<GstMonthlySummaryDto>> gstSummary(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getPurchaseSummary(year, month)));
    }
}
