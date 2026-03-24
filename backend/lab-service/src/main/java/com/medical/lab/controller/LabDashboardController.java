package com.medical.lab.controller;

import com.medical.lab.dto.LabDashboardDto;
import com.medical.lab.service.LabDashboardService;
import com.medical.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lab/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LabDashboardController {

    private final LabDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<LabDashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary()));
    }
}
