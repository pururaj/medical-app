package com.medical.lab.controller;

import com.medical.lab.dto.*;
import com.medical.lab.service.TestCatalogueService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lab/catalogue")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TestCatalogueController {

    private final TestCatalogueService catalogueService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TestCatalogueDto>>> getCatalogues(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(catalogueService.getCatalogues(keyword, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TestCatalogueDto>> getCatalogueById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(catalogueService.getCatalogueById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TestCatalogueDto>> createCatalogue(
            @Valid @RequestBody CreateCatalogueRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test created", catalogueService.createCatalogue(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TestCatalogueDto>> updateCatalogue(
            @PathVariable Long id, @RequestBody UpdateCatalogueRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Test updated", catalogueService.updateCatalogue(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCatalogue(@PathVariable Long id) {
        catalogueService.deleteCatalogue(id);
        return ResponseEntity.ok(ApiResponse.success("Test deactivated", null));
    }
}
