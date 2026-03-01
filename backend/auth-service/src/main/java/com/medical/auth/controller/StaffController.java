package com.medical.auth.controller;

import com.medical.auth.dto.CreateStaffRequest;
import com.medical.auth.dto.StaffDto;
import com.medical.auth.dto.UpdateStaffRequest;
import com.medical.auth.service.StaffService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StaffDto>>> getAllStaff(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<StaffDto> result = staffService.getAllStaff(role, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaffDto>> createStaff(
            @Valid @RequestBody CreateStaffRequest request) {

        StaffDto created = staffService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Staff member created successfully", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffDto>> getStaffById(@PathVariable Long id) {
        StaffDto staff = staffService.getStaffById(id);
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffDto>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStaffRequest request) {

        StaffDto updated = staffService.updateStaff(id, request);
        return ResponseEntity.ok(ApiResponse.success("Staff member updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok(ApiResponse.success("Staff member deactivated", null));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<StaffDto>> toggleActive(@PathVariable Long id) {
        StaffDto updated = staffService.toggleActive(id);
        String message = updated.isActive() ? "Staff member activated" : "Staff member deactivated";
        return ResponseEntity.ok(ApiResponse.success(message, updated));
    }
}
