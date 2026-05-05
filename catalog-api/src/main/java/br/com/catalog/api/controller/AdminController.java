package br.com.catalog.api.controller;

import br.com.catalog.api.dto.AdminRegistroRequest;
import br.com.catalog.api.dto.admin.ArtesaoAdminResponse;
import br.com.catalog.api.dto.admin.DashboardResponse;
import br.com.catalog.api.service.AdminService;
import br.com.catalog.api.service.RegistroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final RegistroService registroService;
    private final AdminService adminService;

    @PostMapping("/registrar")
    public ResponseEntity<Map<String, String>> registrarAdmin(@RequestBody @Valid AdminRegistroRequest request) {
        Map<String, String> resposta = registroService.registrarAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> obterDashboard() {
        return ResponseEntity.ok(adminService.obterMetricasDashboard());
    }

    @GetMapping("/artesaos")
    public ResponseEntity<Page<ArtesaoAdminResponse>> listarArtesaos(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.listarTodosArtesaos(pageable));
    }

    @PutMapping("/artesaos/{id}/verificar")
    public ResponseEntity<ArtesaoAdminResponse> verificarArtesao(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.verificarArtesao(id));
    }

    @PutMapping("/artesaos/{id}/remover-verificacao")
    public ResponseEntity<ArtesaoAdminResponse> removerVerificacao(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.removerVerificacao(id));
    }
}
