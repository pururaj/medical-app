package com.medical.inventory.controller;

import com.medical.inventory.dto.CreateMedicineRequest;
import com.medical.inventory.dto.MedicineDto;
import com.medical.inventory.dto.UpdateMedicineRequest;
import com.medical.inventory.service.MedicineService;
import com.medical.shared.dto.ApiResponse;
import com.medical.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory/medicines")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MedicineDto>>> getMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<MedicineDto> result = medicineService.getMedicines(search, category, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineDto>> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getMedicineById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineDto>> createMedicine(@Valid @RequestBody CreateMedicineRequest request) {
        MedicineDto created = medicineService.createMedicine(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Medicine created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineDto>> updateMedicine(@PathVariable Long id,
                                                                    @RequestBody UpdateMedicineRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Medicine updated successfully", medicineService.updateMedicine(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine deactivated successfully", null));
    }
}
