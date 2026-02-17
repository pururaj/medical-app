package com.medical.patient.controller;

import com.medical.patient.dto.PatientDto;
import com.medical.patient.service.PatientService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@Tag(name = "Patient Management", description = "APIs for managing patients")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Create a new patient")
    public ResponseEntity<ApiResponse<PatientDto>> createPatient(@Valid @RequestBody PatientDto patientDto) {
        PatientDto createdPatient = patientService.createPatient(patientDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient created successfully", createdPatient));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientById(@PathVariable Long id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get patient by email")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientByEmail(@PathVariable String email) {
        PatientDto patient = patientService.getPatientByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping
    @Operation(summary = "Get all patients with pagination")
    public ResponseEntity<ApiResponse<PageResponse<PatientDto>>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        PageResponse<PatientDto> patients = patientService.getAllPatients(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active patients with pagination")
    public ResponseEntity<ApiResponse<PageResponse<PatientDto>>> getActivePatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<PatientDto> patients = patientService.getActivePatients(page, size);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/search")
    @Operation(summary = "Search patients by keyword")
    public ResponseEntity<ApiResponse<PageResponse<PatientDto>>> searchPatients(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<PatientDto> patients = patientService.searchPatients(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update patient")
    public ResponseEntity<ApiResponse<PatientDto>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientDto patientDto) {
        PatientDto updatedPatient = patientService.updatePatient(id, patientDto);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", updatedPatient));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete patient (deactivate)")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deactivated successfully", null));
    }

    @DeleteMapping("/{id}/hard")
    @Operation(summary = "Hard delete patient (permanent)")
    public ResponseEntity<ApiResponse<Void>> hardDeletePatient(@PathVariable Long id) {
        patientService.hardDeletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted permanently", null));
    }
}
