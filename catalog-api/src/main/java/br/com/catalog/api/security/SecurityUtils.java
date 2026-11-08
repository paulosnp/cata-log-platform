package br.com.catalog.api.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final JwtService jwtService;

    public Long getUsuarioLogadoId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) auth.getCredentials();
        return jwtService.extractUserId(token);
    }

    /** Claim "role" do JWT: ADMIN, ARTESAO ou COMPRADOR. */
    public String getPapelUsuarioLogado() {
        String token = (String) SecurityContextHolder.getContext().getAuthentication().getCredentials();
        return jwtService.extractRole(token);
    }

    public String getEmailUsuarioLogado() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
