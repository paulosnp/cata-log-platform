package br.com.catalog.api.controller;

import br.com.catalog.api.dto.AdminRegistroRequest;
import br.com.catalog.api.service.RegistroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final RegistroService registroService;

    @PostMapping("/registrar")
    public ResponseEntity<Map<String, String>> registrarAdmin(@RequestBody @Valid AdminRegistroRequest request) {
        Map<String, String> resposta = registroService.registrarAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }
}
