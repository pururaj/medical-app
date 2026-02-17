package com.medical.gateway.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Fallback controller for circuit breaker
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/patient-service")
    public ResponseEntity<Map<String, Object>> patientServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Patient service is currently unavailable. Please try again later.");
        response.put("timestamp", LocalDateTime.now());
        response.put("errorCode", "SERVICE_UNAVAILABLE");

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/appointment-service")
    public ResponseEntity<Map<String, Object>> appointmentServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Appointment service is currently unavailable. Please try again later.");
        response.put("timestamp", LocalDateTime.now());
        response.put("errorCode", "SERVICE_UNAVAILABLE");

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
