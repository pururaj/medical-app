package com.medical.inventory.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaudeVisionService {

    private final RestTemplate restTemplate;

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.url}")
    private String apiUrl;

    @Value("${claude.api.model}")
    private String model;

    public String analyzeImage(String base64Image, String mediaType, String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> imageSource = Map.of(
                "type", "base64",
                "media_type", mediaType,
                "data", base64Image
        );

        Map<String, Object> imageContent = Map.of(
                "type", "image",
                "source", imageSource
        );

        Map<String, Object> textContent = Map.of(
                "type", "text",
                "text", prompt
        );

        Map<String, Object> message = Map.of(
                "role", "user",
                "content", List.of(imageContent, textContent)
        );

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", 2048,
                "messages", List.of(message)
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<?> content = (List<?>) response.getBody().get("content");
                if (content != null && !content.isEmpty()) {
                    Map<?, ?> firstContent = (Map<?, ?>) content.get(0);
                    return (String) firstContent.get("text");
                }
            }
        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            throw new RuntimeException("Claude API call failed: " + e.getMessage(), e);
        }

        throw new RuntimeException("No response from Claude API");
    }
}
