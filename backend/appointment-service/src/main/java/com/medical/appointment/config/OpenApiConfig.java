package com.medical.appointment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI appointmentServiceOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8082");
        localServer.setDescription("Local Development Server");

        Contact contact = new Contact();
        contact.setName("Medical App Team");
        contact.setEmail("support@medicalapp.com");

        License license = new License()
                .name("Apache 2.0")
                .url("https://www.apache.org/licenses/LICENSE-2.0.html");

        Info info = new Info()
                .title("Appointment Service API")
                .version("1.0.0")
                .description("RESTful API for booking and managing appointments in the Medical App")
                .contact(contact)
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer));
    }
}
