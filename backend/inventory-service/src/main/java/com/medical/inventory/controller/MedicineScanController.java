package com.medical.inventory.controller;

import com.medical.inventory.dto.*;
import com.medical.inventory.service.BarcodeScanService;
import com.medical.inventory.service.BillScanService;
import com.medical.inventory.service.MedicineService;
import com.medical.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/inventory/medicines")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MedicineScanController {

    private final BillScanService billScanService;
    private final BarcodeScanService barcodeScanService;
    private final MedicineService medicineService;

    @PostMapping("/scan-bill")
    public ResponseEntity<ApiResponse<BillScanResponse>> scanBill(
            @RequestParam("image") MultipartFile image) {
        try {
            BillScanResponse response = billScanService.scanBill(image);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("Bill scan error: {}", e.getMessage());
            String userMessage = buildUserMessage(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(ApiResponse.error(userMessage));
        }
    }

    @PostMapping("/scan-barcode")
    public ResponseEntity<ApiResponse<ScannedMedicineDto>> scanBarcode(
            @RequestBody BarcodeScanRequest request) {
        ScannedMedicineDto dto = barcodeScanService.lookupBarcode(request.getBarcode());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/scan-label")
    public ResponseEntity<ApiResponse<ScannedMedicineDto>> scanLabel(
            @RequestParam("image") MultipartFile image) {
        try {
            ScannedMedicineDto dto = barcodeScanService.scanLabel(image);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            log.error("Label scan error: {}", e.getMessage());
            String userMessage = buildUserMessage(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(ApiResponse.error(userMessage));
        }
    }

    private String buildUserMessage(RuntimeException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "";
        if (msg.contains("has not been used in project") || msg.contains("SERVICE_DISABLED")) {
            return "Google Generative Language API (Gemini) is not enabled. " +
                   "Go to console.cloud.google.com → APIs & Services → Enable 'Generative Language API', then retry.";
        }
        if (msg.contains("Cloud Vision API has not been used") || msg.contains("Vision API")) {
            return "Google Cloud Vision API is not enabled. " +
                   "Go to console.cloud.google.com → APIs & Services → Enable 'Cloud Vision API', then retry.";
        }
        if (msg.contains("401") || msg.contains("Unauthorized") || msg.contains("API key not valid")) {
            return "Google API key is invalid. Please check the GOOGLE_API_KEY in application.yml.";
        }
        if (msg.contains("403") || msg.contains("PERMISSION_DENIED")) {
            return "Google API access denied. Ensure the API key has Cloud Vision and Generative Language APIs enabled.";
        }
        if (msg.contains("429") || msg.contains("RESOURCE_EXHAUSTED") || msg.contains("Too Many")) {
            return "Google API rate limit reached. Please try again in a moment.";
        }
        if (msg.contains("timeout") || msg.contains("connect")) {
            return "AI service is unreachable. Please check your network connection.";
        }
        return "AI analysis failed: " + msg;
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> bulkCreate(
            @RequestBody BulkCreateRequest request) {
        List<MedicineDto> medicines = medicineService.bulkCreate(request);
        return ResponseEntity.ok(ApiResponse.success(medicines));
    }
}
