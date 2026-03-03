package com.medical.pharmacy.controller;

import com.medical.pharmacy.dto.CreateReturnRequest;
import com.medical.pharmacy.dto.SaleReturnDto;
import com.medical.pharmacy.service.ReturnService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pharmacy/returns")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SaleReturnDto>>> getReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturns(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleReturnDto>> getReturnById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturnById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SaleReturnDto>> createReturn(@Valid @RequestBody CreateReturnRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Return processed", returnService.createReturn(req)));
    }
}
