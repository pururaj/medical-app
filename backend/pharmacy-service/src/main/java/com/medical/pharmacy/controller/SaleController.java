package com.medical.pharmacy.controller;

import com.medical.pharmacy.dto.CreateSaleRequest;
import com.medical.pharmacy.dto.SaleDto;
import com.medical.pharmacy.service.SaleService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pharmacy/sales")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SaleDto>>> getSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(ApiResponse.success(saleService.getSales(page, size, status, startDate, endDate)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleDto>> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(saleService.getSaleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SaleDto>> createSale(@Valid @RequestBody CreateSaleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sale completed", saleService.createSale(req)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SaleDto>> cancelSale(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sale cancelled", saleService.cancelSale(id)));
    }
}
