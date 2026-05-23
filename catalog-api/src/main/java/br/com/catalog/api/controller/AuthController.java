package br.com.catalog.api.controller;

import br.com.catalog.api.dto.*;
import br.com.catalog.api.service.AuthService;
import br.com.catalog.api.service.RegistroService;
import br.com.catalog.api.service.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RegistroService registroService;
    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/artesao/login")
    public ResponseEntity<LoginResponse> loginArtesao(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.loginArtesao(request));
    }

    @PostMapping("/comprador/login")
    public ResponseEntity<LoginResponse> loginComprador(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.loginComprador(request));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> loginAdmin(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.loginAdmin(request));
    }

    @PostMapping("/artesao/registrar")
    public ResponseEntity<Map<String, String>> registrarArtesao(@RequestBody @Valid ArtesaoRegistroRequest request) {
        registroService.registrarArtesao(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensagem", "Artesão cadastrado com sucesso."));
    }

    @PostMapping("/comprador/registrar")
    public ResponseEntity<Map<String, String>> registrarComprador(@RequestBody @Valid CompradorRegistroRequest request) {
        registroService.registrarComprador(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensagem", "Comprador cadastrado com sucesso."));
    }

    // RF-BK07: Troca de senha obrigatória (exige token JWT no header)
    @PostMapping("/trocar-senha")
    public ResponseEntity<Map<String, String>> trocarSenha(@RequestBody @Valid TrocarSenhaRequest request) {
        authService.trocarSenha(request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha atualizada com sucesso."));
    }

    // RF-BK06: Solicitar PIN de recuperação (rota pública)
    @PostMapping("/esqueci-senha")
    public ResponseEntity<Map<String, String>> esqueciSenha(@RequestBody @Valid EsqueciSenhaRequest request) {
        authService.esqueciSenha(request);
        return ResponseEntity.ok(Map.of("mensagem", "Se o e-mail existir, um código de recuperação foi enviado."));
    }

    // RF-BK06: Verificar PIN sem redefinir senha (rota pública)
    @PostMapping("/verificar-pin")
    public ResponseEntity<Map<String, String>> verificarPin(@RequestBody Map<String, String> body) {
        EsqueciSenhaRequest emailReq = new EsqueciSenhaRequest();
        emailReq.setEmail(body.get("email"));
        authService.verificarPin(emailReq, body.get("pin"));
        return ResponseEntity.ok(Map.of("mensagem", "Código válido."));
    }

    // RF-BK06: Redefinir senha com PIN (rota pública)
    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(@RequestBody @Valid RedefinirSenhaRequest request) {
        authService.redefinirSenha(request);
        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso."));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenBlacklistService.blacklist(authHeader.substring(7));
        }
        return ResponseEntity.ok(Map.of("mensagem", "Logout realizado com sucesso."));
    }
}
