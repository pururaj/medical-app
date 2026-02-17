package com.medical.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Programmatic route configuration as an alternative to YAML
 * Use this for dynamic routing or complex routing logic
 */
@Configuration
public class GatewayConfig {

    // Routes are defined in application.yml
    // This configuration class can be used for additional customization

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Add custom routes here if needed
                .build();
    }
}
