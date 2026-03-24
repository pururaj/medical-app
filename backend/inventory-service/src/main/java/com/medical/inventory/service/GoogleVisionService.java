package com.medical.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleVisionService {

    private final RestTemplate restTemplate;

    @Value("${google.api.key}")
    private String apiKey;

    // images:annotate  — for JPEG, PNG, WebP, BMP, GIF, TIFF, ICO
    private static final String VISION_IMAGE_URL = "https://vision.googleapis.com/v1/images:annotate";
    // files:annotate   — for PDF (inline, up to 5 pages)
    private static final String VISION_PDF_URL   = "https://vision.googleapis.com/v1/files:annotate";
    private static final String GEMINI_URL        = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    /**
     * Extracts all text from the uploaded file. Routes to the PDF endpoint when
     * mediaType is application/pdf; falls back to the image endpoint otherwise.
     */
    public String extractText(String base64Content, String mediaType) {
        if ("application/pdf".equalsIgnoreCase(mediaType)) {
            return extractTextFromPdf(base64Content);
        }
        return extractTextFromImage(base64Content);
    }

    // ── image endpoint ────────────────────────────────────────────────────────

    private String extractTextFromImage(String base64Image) {
        String url = VISION_IMAGE_URL + "?key=" + apiKey;

        Map<String, Object> body = Map.of(
                "requests", List.of(Map.of(
                        "image",    Map.of("content", base64Image),
                        "features", List.of(Map.of("type", "DOCUMENT_TEXT_DETECTION"))
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    url, new HttpEntity<>(body, headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<?> responses = (List<?>) response.getBody().get("responses");
                if (responses != null && !responses.isEmpty()) {
                    Map<?, ?> first = (Map<?, ?>) responses.get(0);

                    Map<?, ?> error = (Map<?, ?>) first.get("error");
                    if (error != null) {
                        String msg = (String) error.get("message");
                        log.error("Google Vision image API error: {}", msg);
                        throw new RuntimeException("Google Vision API error: " + msg);
                    }

                    Map<?, ?> fullText = (Map<?, ?>) first.get("fullTextAnnotation");
                    if (fullText != null) {
                        String text = (String) fullText.get("text");
                        log.debug("Vision (image) extracted {} chars", text != null ? text.length() : 0);
                        return text;
                    }

                    // Fallback: textAnnotations[0].description
                    List<?> textAnnotations = (List<?>) first.get("textAnnotations");
                    if (textAnnotations != null && !textAnnotations.isEmpty()) {
                        String desc = (String) ((Map<?, ?>) textAnnotations.get(0)).get("description");
                        if (desc != null && !desc.isBlank()) {
                            log.debug("Vision (image-fallback) extracted {} chars", desc.length());
                            return desc;
                        }
                    }

                    log.warn("Vision image API: no text in response. Keys: {}", first.keySet());
                }
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Vision image API call failed: {}", e.getMessage());
            throw new RuntimeException("Google Vision API call failed: " + e.getMessage(), e);
        }

        throw new RuntimeException("No text could be extracted from the image");
    }

    // ── PDF endpoint ──────────────────────────────────────────────────────────

    private String extractTextFromPdf(String base64Pdf) {
        String url = VISION_PDF_URL + "?key=" + apiKey;

        // Process up to 5 pages (Vision API inline PDF limit)
        Map<String, Object> body = Map.of(
                "requests", List.of(Map.of(
                        "inputConfig", Map.of(
                                "mimeType", "application/pdf",
                                "content",  base64Pdf
                        ),
                        "features", List.of(Map.of("type", "DOCUMENT_TEXT_DETECTION")),
                        "pages",    List.of(1, 2, 3, 4, 5)
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    url, new HttpEntity<>(body, headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // PDF response: { "responses": [ { "responses": [ { "fullTextAnnotation": {...} }, ... ] } ] }
                List<?> outerResponses = (List<?>) response.getBody().get("responses");
                if (outerResponses != null && !outerResponses.isEmpty()) {
                    Map<?, ?> outerFirst = (Map<?, ?>) outerResponses.get(0);

                    Map<?, ?> error = (Map<?, ?>) outerFirst.get("error");
                    if (error != null) {
                        String msg = (String) error.get("message");
                        log.error("Google Vision PDF API error: {}", msg);
                        throw new RuntimeException("Google Vision API error: " + msg);
                    }

                    List<?> pageResponses = (List<?>) outerFirst.get("responses");
                    if (pageResponses != null && !pageResponses.isEmpty()) {
                        List<String> pageTexts = new ArrayList<>();
                        for (Object pageResp : pageResponses) {
                            Map<?, ?> pageMap  = (Map<?, ?>) pageResp;
                            Map<?, ?> fullText = (Map<?, ?>) pageMap.get("fullTextAnnotation");
                            if (fullText != null) {
                                String text = (String) fullText.get("text");
                                if (text != null && !text.isBlank()) {
                                    pageTexts.add(text);
                                }
                            }
                        }
                        if (!pageTexts.isEmpty()) {
                            String combined = String.join("\n", pageTexts);
                            log.debug("Vision (PDF) extracted {} chars across {} pages",
                                    combined.length(), pageTexts.size());
                            return combined;
                        }
                    }

                    log.warn("Vision PDF API: no text in response. Outer keys: {}", outerFirst.keySet());
                }
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Vision PDF API call failed: {}", e.getMessage());
            throw new RuntimeException("Google Vision API call failed: " + e.getMessage(), e);
        }

        throw new RuntimeException("No text could be extracted from the PDF");
    }

    // ── Gemini text parser ────────────────────────────────────────────────────

    /**
     * Calls Gemini API (text-only) to convert raw invoice text into structured JSON.
     */
    public String parseWithGemini(String extractedText, String prompt) {
        String url = GEMINI_URL + "?key=" + apiKey;

        String fullPrompt = prompt + "\n\n" + extractedText;

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", fullPrompt))
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    url, new HttpEntity<>(body, headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<?> candidates = (List<?>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> first   = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) first.get("content");
                    if (content != null) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            return (String) ((Map<?, ?>) parts.get(0)).get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }

        throw new RuntimeException("No response from Gemini API");
    }
}
