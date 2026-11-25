package com.medical.lab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.medical.lab", "com.medical.shared"})
@EnableJpaAuditing
public class LabServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LabServiceApplication.class, args);
    }
}
