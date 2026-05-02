package br.com.catalog.api.controller;

import br.com.catalog.api.dto.chat.ChatTokenResponse;
import br.com.catalog.api.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/token")
    @PreAuthorize("hasAnyAuthority('COMPRADOR', 'ARTESAO')")
    public ResponseEntity<ChatTokenResponse> gerarToken() {
        return ResponseEntity.ok(chatService.gerarStreamToken());
    }
}
