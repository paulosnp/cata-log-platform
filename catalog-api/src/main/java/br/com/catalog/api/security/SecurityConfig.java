package br.com.catalog.api.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Rotas públicas de autenticação (RF-BK01, RF-BK11)
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // Vitrine pública — leitura sem autenticação (RF-BK03)
                        .requestMatchers(HttpMethod.GET, "/api/v1/produtos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/artesaos/vitrine").permitAll()

                        // Imagens estáticas dos produtos (Sprint 6)
                        .requestMatchers("/imagens/**").permitAll()

                        // Webhooks — chamados por servidores externos sem JWT (Sprint 16)
                        .requestMatchers("/api/v1/webhooks/**").permitAll()

                        // Swagger / OpenAPI (RNF-DOC01)
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // RN-02: Rotas administrativas restritas a ADMIN
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")

                        // Carrinho e Pedidos — autenticado (Sprint 7)
                        // Proteção granular via @PreAuthorize("hasAuthority('...')") nos controllers

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Imagens estáticas servidas em /imagens/** já são permitAll() na chain
     * e passam pelo filtro de CORS normalmente.
     * NÃO usar web.ignoring() aqui — isso desabilita o CorsFilter e causa
     * bloqueio de CORS no browser (Flutter Web, Frontend Next.js, etc.).
     */

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://prismcode.site",
                "http://prismcode.site",
                "https://www.prismcode.site",
                "http://www.prismcode.site",
                "https://admin.prismcode.site",
                "http://admin.prismcode.site"
        ));
        // Flutter Web roda em portas dinamicas — permitir qualquer localhost em dev
        config.setAllowedOriginPatterns(List.of("http://localhost:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
