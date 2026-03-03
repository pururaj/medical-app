package com.medical.pharmacy.controller;

import com.medical.pharmacy.dto.POSSummaryDto;
import com.medical.pharmacy.service.POSService;
import com.medical.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pharmacy")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class POSController {

    private final POSService posService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<POSSummaryDto>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(posService.getSummary()));
    }
}
