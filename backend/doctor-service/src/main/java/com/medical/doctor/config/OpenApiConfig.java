package com.medical.doctor.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI doctorServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Doctor Service API")
                        .description("REST API for managing doctor profiles, specializations, and availability")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Medical App Team")
                                .email("dev@medicalapp.com")));
    }
}
