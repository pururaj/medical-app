package com.medical.lab.controller;

import com.medical.lab.dto.*;
import com.medical.lab.service.LabOrderService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lab/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LabOrderController {

    private final LabOrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LabOrderDto>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrders(page, size, status, startDate, endDate)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LabOrderDto>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LabOrderDto>> createOrder(@Valid @RequestBody CreateOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lab order created", orderService.createOrder(req)));
    }

    @PutMapping("/{id}/collect-sample")
    public ResponseEntity<ApiResponse<LabOrderDto>> collectSample(
            @PathVariable Long id, @Valid @RequestBody CollectSampleRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Sample collected", orderService.collectSample(id, req)));
    }

    @PutMapping("/{id}/in-progress")
    public ResponseEntity<ApiResponse<LabOrderDto>> markInProgress(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order marked in-progress", orderService.markInProgress(id)));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<LabOrderDto>> completeOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order completed", orderService.completeOrder(id)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LabOrderDto>> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", orderService.cancelOrder(id)));
    }
}
