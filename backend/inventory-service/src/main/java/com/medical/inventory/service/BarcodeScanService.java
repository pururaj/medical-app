package com.medical.inventory.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.inventory.dto.ScannedMedicineDto;
import com.medical.inventory.entity.Medicine;
import com.medical.inventory.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BarcodeScanService {

    private final MedicineRepository medicineRepo;
    private final ClaudeVisionService claudeVisionService;
    private final ObjectMapper objectMapper;

    private static final String LABEL_PROMPT =
            "Extract medicine details from this medicine packaging label. " +
            "Return ONLY a JSON object with these fields: " +
            "name (string), genericName (string), manufacturer (string), " +
            "category (one of: TABLET/CAPSULE/SYRUP/INJECTION/CREAM/DROPS/OTHER), " +
            "unit (one of: TABLET/CAPSULE/ML/MG/UNIT), " +
            "unitPrice (decimal or null if not visible), barcode (string or null). " +
            "No extra text, no markdown, just the JSON object.";

    public ScannedMedicineDto lookupBarcode(String barcode) {
        Optional<Medicine> existing = medicineRepo.findByBarcode(barcode);
        if (existing.isPresent()) {
            Medicine m = existing.get();
            return ScannedMedicineDto.builder()
                    .name(m.getName())
                    .genericName(m.getGenericName())
                    .manufacturer(m.getManufacturer())
                    .category(m.getCategory() != null ? m.getCategory().name() : null)
                    .unit(m.getUnit() != null ? m.getUnit().name() : null)
                    .unitPrice(m.getUnitPrice())
                    .barcode(barcode)
                    .build();
        }
        // Not found — return minimal dto with barcode set so frontend can navigate to new form
        return ScannedMedicineDto.builder().barcode(barcode).build();
    }

    public ScannedMedicineDto scanLabel(MultipartFile image) {
        try {
            byte[] bytes = image.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(bytes);
            String mediaType = image.getContentType() != null ? image.getContentType() : "image/jpeg";

            String rawResponse = claudeVisionService.analyzeImage(base64Image, mediaType, LABEL_PROMPT);
            log.debug("Claude label response: {}", rawResponse);

            String json = rawResponse.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }

            return objectMapper.readValue(json, ScannedMedicineDto.class);

        } catch (Exception e) {
            log.error("Label scan failed: {}", e.getMessage());
            throw new RuntimeException("Label scan failed: " + e.getMessage(), e);
        }
    }
}
