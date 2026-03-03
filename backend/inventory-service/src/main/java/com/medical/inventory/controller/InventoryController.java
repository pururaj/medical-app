package com.medical.inventory.controller;

import com.medical.inventory.dto.*;
import com.medical.inventory.service.InventoryService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<InventorySummaryDto>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getSummary()));
    }

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<PageResponse<InventoryStockDto>>> getAllStock(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllStock(page, size)));
    }

    @GetMapping("/stock/low-stock")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getLowStockMedicines() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockMedicines()));
    }

    @GetMapping("/stock/medicine/{medicineId}")
    public ResponseEntity<ApiResponse<List<InventoryStockDto>>> getStockForMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getStockForMedicine(medicineId)));
    }

    @PostMapping("/stock/adjust")
    public ResponseEntity<ApiResponse<StockTransactionDto>> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        StockTransactionDto result = inventoryService.adjustStock(request);
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", result));
    }

    @GetMapping("/transactions/medicine/{medicineId}")
    public ResponseEntity<ApiResponse<List<StockTransactionDto>>> getTransactions(@PathVariable Long medicineId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getTransactionsForMedicine(medicineId)));
    }
}
