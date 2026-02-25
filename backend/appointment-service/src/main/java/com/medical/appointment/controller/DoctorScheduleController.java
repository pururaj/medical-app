package com.medical.appointment.controller;

import com.medical.appointment.dto.DoctorScheduleDto;
import com.medical.appointment.service.DoctorScheduleService;
import com.medical.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor-schedules")
@RequiredArgsConstructor
@Tag(name = "Doctor Schedule Management", description = "APIs for managing doctor availability schedules")
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;

    @PostMapping
    @Operation(summary = "Create doctor schedule")
    public ResponseEntity<ApiResponse<DoctorScheduleDto>> createSchedule(
            @Valid @RequestBody DoctorScheduleDto scheduleDto) {
        DoctorScheduleDto created = scheduleService.createSchedule(scheduleDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Schedule created successfully", created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get schedule by ID")
    public ResponseEntity<ApiResponse<DoctorScheduleDto>> getScheduleById(@PathVariable Long id) {
        DoctorScheduleDto schedule = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(ApiResponse.success(schedule));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get all schedules for a doctor")
    public ResponseEntity<ApiResponse<List<DoctorScheduleDto>>> getSchedulesByDoctor(
            @PathVariable Long doctorId) {
        List<DoctorScheduleDto> schedules = scheduleService.getSchedulesByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success(schedules));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update doctor schedule")
    public ResponseEntity<ApiResponse<DoctorScheduleDto>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody DoctorScheduleDto scheduleDto) {
        DoctorScheduleDto updated = scheduleService.updateSchedule(id, scheduleDto);
        return ResponseEntity.ok(ApiResponse.success("Schedule updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete doctor schedule")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted successfully", null));
    }
}
