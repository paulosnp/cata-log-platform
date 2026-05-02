package br.com.catalog.api.service;

import br.com.catalog.api.dto.chat.ChatTokenResponse;
import br.com.catalog.api.security.SecurityUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final SecurityUtils securityUtils;

    @Value("${stream.chat.api-key}")
    private String apiKey;

    @Value("${stream.chat.api-secret}")
    private String apiSecret;

    /**
     * Gera um token JWT compatível com o Stream Chat para o utilizador logado.
     * O token usa o formato padrão do Stream: JWT assinado com HS256,
     * contendo a claim "user_id" com o ID do utilizador.
     */
    public ChatTokenResponse gerarStreamToken() {
        Long userId = securityUtils.getUsuarioLogadoId();

        SecretKey key = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));

        String token = Jwts.builder()
                .claim("user_id", String.valueOf(userId))
                .signWith(key)
                .compact();

        return ChatTokenResponse.builder()
                .token(token)
                .build();
    }
}
