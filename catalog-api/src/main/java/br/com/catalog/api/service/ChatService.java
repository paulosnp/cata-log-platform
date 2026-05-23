package br.com.catalog.api.service;

import br.com.catalog.api.dto.chat.ChatTokenResponse;
import br.com.catalog.api.security.JwtService;
import br.com.catalog.api.security.SecurityUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final SecurityUtils securityUtils;
    private final JwtService jwtService;

    @Value("${stream.chat.api-key}")
    private String apiKey;

    @Value("${stream.chat.api-secret}")
    private String apiSecret;

    /**
     * Gera um token JWT compatível com o Stream Chat para o utilizador logado.
     * O token usa o formato padrão do Stream: JWT assinado com HS256,
     * contendo a claim "user_id" com o ID do utilizador.
     *
     * NOTA: Deve ser HS256 obrigatoriamente — o Stream Chat rejeita HS512.
     * Como o secret tem 512 bits, o jjwt auto-selecciona HS512 se não
     * especificarmos o algoritmo explicitamente.
     */
    public ChatTokenResponse gerarStreamToken() {
        Long userId = securityUtils.getUsuarioLogadoId();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) auth.getCredentials();
        String role = jwtService.extractRole(token);

        String streamUserId = ("ARTESAO".equals(role) ? "artesao_" : "comprador_") + userId;

        SecretKey key = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));

        String streamToken = Jwts.builder()
                .claim("user_id", streamUserId)
                .signWith(key, Jwts.SIG.HS256)
                .compact();

        return ChatTokenResponse.builder()
                .token(streamToken)
                .build();
    }
}
