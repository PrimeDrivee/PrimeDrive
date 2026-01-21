package com.example.PrimeDriveBackend.config.SecurityRules;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

/**
 * Defines security rules for Swagger-related endpoints.
 *
 * This class provides public access to the Swagger UI and API documentation
 * endpoints used for exploring and testing the REST API.
 *
 * @author Fatlum Epiroti
 * @version 1.0
 * @since 2025-06-03
 */
public class SwaggerSecurityRules {
    /**
     * Configures HTTP security to allow unrestricted access to Swagger UI
     * endpoints.
     *
     * This includes the Swagger UI, OpenAPI documentation, and related resources.
     *
     * @param http the HttpSecurity object used to configure web based security for
     *             specific http requests
     * @throws Exception if an error occurs while configuring the security settings
     */
    public static void apply(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-ui.html")
                .permitAll());
    }
}
