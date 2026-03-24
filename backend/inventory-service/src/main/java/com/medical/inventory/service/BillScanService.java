package com.medical.inventory.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.inventory.dto.BillScanResponse;
import com.medical.inventory.dto.ScannedMedicineDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillScanService {

    private final GoogleVisionService googleVisionService;
    private final ObjectMapper objectMapper;

    private static final String PARSE_PROMPT =
            "From the following invoice text, extract all medicines. " +
            "Return ONLY a JSON array with objects having these fields: " +
            "name (string), genericName (string), manufacturer (string), " +
            "category (one of: TABLET/CAPSULE/SYRUP/INJECTION/CREAM/DROPS/OTHER), " +
            "unit (one of: TABLET/CAPSULE/ML/MG/UNIT), " +
            "quantity (integer), unitPrice (decimal number). " +
            "No extra text, no markdown, just the JSON array. Invoice text:";

    public BillScanResponse scanBill(MultipartFile image) {
        try {
            byte[] bytes = image.getBytes();
            if (bytes.length == 0) {
                throw new RuntimeException("Uploaded file is empty");
            }
            log.info("Bill scan: file={}, size={}B, contentType={}",
                    image.getOriginalFilename(), bytes.length, image.getContentType());

            String mediaType   = image.getContentType() != null ? image.getContentType() : "image/jpeg";
            String base64Image = Base64.getEncoder().encodeToString(bytes);
            log.debug("Base64 length: {}", base64Image.length());

            // Step 1: Extract text (routes to PDF or image endpoint automatically)
            String extractedText = googleVisionService.extractText(base64Image, mediaType);
            log.debug("Vision API extracted text: {}", extractedText);

            // Step 2: Convert extracted text to structured JSON via Gemini
            String rawResponse = googleVisionService.parseWithGemini(extractedText, PARSE_PROMPT);
            log.debug("Gemini raw response: {}", rawResponse);

            // Strip markdown code blocks if present
            String json = rawResponse.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }

            List<ScannedMedicineDto> medicines;
            try {
                medicines = objectMapper.readValue(json, new TypeReference<List<ScannedMedicineDto>>() {});
            } catch (Exception e) {
                log.warn("Could not parse Gemini response as medicine list: {}", e.getMessage());
                medicines = Collections.emptyList();
            }

            return BillScanResponse.builder()
                    .medicines(medicines)
                    .rawResponse(rawResponse)
                    .build();

        } catch (Exception e) {
            log.error("Bill scan failed: {}", e.getMessage());
            throw new RuntimeException("Bill scan failed: " + e.getMessage(), e);
        }
    }
}
