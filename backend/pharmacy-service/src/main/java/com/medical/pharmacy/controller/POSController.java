package com.medical.pharmacy.controller;

import com.medical.pharmacy.dto.DayEndReportDto;
import com.medical.pharmacy.dto.POSSummaryDto;
import com.medical.pharmacy.service.DayEndReportService;
import com.medical.pharmacy.service.POSService;
import com.medical.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/pharmacy")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class POSController {

    private final POSService posService;
    private final DayEndReportService dayEndReportService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<POSSummaryDto>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(posService.getSummary()));
    }

    @GetMapping("/day-end-report")
    public ResponseEntity<ApiResponse<DayEndReportDto>> getDayEndReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(dayEndReportService.generateReport(date)));
    }
}
