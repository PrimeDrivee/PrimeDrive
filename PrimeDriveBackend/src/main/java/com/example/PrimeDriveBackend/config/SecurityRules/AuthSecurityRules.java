package com.example.PrimeDriveBackend.config.SecurityRules;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

/**
 * Defines security rules for authentication-related endpoints.
 *
 * This class contains static methods that configure public access to specific
 * authentication endpoints such as login, register, session checking, and
 * Swagger UI endpoints.
 * 
 * @author Fatlum Epiroti
 * @version 1.0
 * @since 2025-06-03
 */
public class AuthSecurityRules {
    /**
     * Configures HTTP security to allow public access to authentication-related
     * endpoints.
     *
     * This includes endpoints for login, registration, session validation, and
     * Swagger-specific
     * login/register routes. These routes are accessible without authentication.
     *
     * @param http the HttpSecurity object used to configure web based security for
     *             specific http requests
     * @throws Exception if an error occurs while configuring the security settings
     */
    public static void apply(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/api/authentication/login",
                        "/api/authentication/register",
                        "/api/authentication/check-session",
                        "/api/authentication/swagger-login",
                        "/api/authentication/swagger-register",
                        "/actuator/health",
                        "/actuator/**")
                .permitAll());
    }
}
