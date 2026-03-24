package com.medical.lab.controller;

import com.medical.lab.dto.CreateResultRequest;
import com.medical.lab.dto.TestResultDto;
import com.medical.lab.service.TestResultService;
import com.medical.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lab/results")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TestResultController {

    private final TestResultService resultService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestResultDto>>> getResultsByOrderId(
            @RequestParam Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getResultsByOrderId(orderId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TestResultDto>> createResult(
            @Valid @RequestBody CreateResultRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Result entered", resultService.createResult(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TestResultDto>> updateResult(
            @PathVariable Long id, @RequestBody CreateResultRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Result updated", resultService.updateResult(id, req)));
    }
}
