package com.medical.doctor.controller;

import com.medical.doctor.dto.DoctorDto;
import com.medical.doctor.service.DoctorService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor Management", description = "APIs for managing doctor profiles and availability")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    @Operation(summary = "Create a new doctor profile")
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(@Valid @RequestBody DoctorDto dto) {
        DoctorDto created = doctorService.createDoctor(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor profile created successfully", created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable Long id) {
        DoctorDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @GetMapping
    @Operation(summary = "Get all active doctors with optional search and pagination")
    public ResponseEntity<ApiResponse<PageResponse<DoctorDto>>> getDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<DoctorDto> doctors;
        if (specialization != null || city != null || available != null) {
            doctors = doctorService.searchDoctors(specialization, city, available, page, size);
        } else {
            doctors = doctorService.getAllDoctors(page, size);
        }
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/specialization/{specialization}")
    @Operation(summary = "Get doctors by specialization")
    public ResponseEntity<ApiResponse<PageResponse<DoctorDto>>> getDoctorsBySpecialization(
            @PathVariable String specialization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<DoctorDto> doctors = doctorService.getDoctorsBySpecialization(specialization, page, size);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/available")
    @Operation(summary = "Get all available doctors")
    public ResponseEntity<ApiResponse<PageResponse<DoctorDto>>> getAvailableDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<DoctorDto> doctors = doctorService.getAvailableDoctors(page, size);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/specializations")
    @Operation(summary = "Get list of all available specializations")
    public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
        List<String> specializations = doctorService.getSpecializations();
        return ResponseEntity.ok(ApiResponse.success(specializations));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get list of all cities with active doctors")
    public ResponseEntity<ApiResponse<List<String>>> getCities() {
        List<String> cities = doctorService.getCities();
        return ResponseEntity.ok(ApiResponse.success(cities));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update doctor profile")
    public ResponseEntity<ApiResponse<DoctorDto>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorDto dto) {
        DoctorDto updated = doctorService.updateDoctor(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile updated successfully", updated));
    }

    @PutMapping("/{id}/toggle-availability")
    @Operation(summary = "Toggle doctor availability status")
    public ResponseEntity<ApiResponse<DoctorDto>> toggleAvailability(@PathVariable Long id) {
        DoctorDto updated = doctorService.toggleAvailability(id);
        String message = Boolean.TRUE.equals(updated.getAvailable())
                ? "Doctor is now available for appointments"
                : "Doctor is now unavailable for appointments";
        return ResponseEntity.ok(ApiResponse.success(message, updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a doctor profile")
    public ResponseEntity<ApiResponse<Void>> deactivateDoctor(@PathVariable Long id) {
        doctorService.deactivateDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile deactivated successfully", null));
    }
}
