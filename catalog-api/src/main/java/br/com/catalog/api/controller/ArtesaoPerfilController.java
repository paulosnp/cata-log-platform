package br.com.catalog.api.controller;

import br.com.catalog.api.dto.ArtesaoPerfilResponse;
import br.com.catalog.api.dto.AtualizarPerfilRequest;
import br.com.catalog.api.dto.FinanceiroArtesaoResponse;
import br.com.catalog.api.service.ArtesaoPerfilService;
import br.com.catalog.api.service.FinanceiroArtesaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/artesaos")
@RequiredArgsConstructor
public class ArtesaoPerfilController {

    private final ArtesaoPerfilService artesaoPerfilService;
    private final FinanceiroArtesaoService financeiroArtesaoService;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ARTESAO')")
    public ResponseEntity<ArtesaoPerfilResponse> meuPerfil() {
        return ResponseEntity.ok(artesaoPerfilService.getMeuPerfil());
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('ARTESAO')")
    public ResponseEntity<ArtesaoPerfilResponse> atualizarPerfil(
            @RequestBody AtualizarPerfilRequest request) {
        return ResponseEntity.ok(artesaoPerfilService.atualizarPerfil(request));
    }

    @PostMapping(value = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ARTESAO')")
    public ResponseEntity<ArtesaoPerfilResponse> uploadFoto(
            @RequestParam("arquivo") MultipartFile arquivo) {
        return ResponseEntity.ok(artesaoPerfilService.uploadFoto(arquivo));
    }

    @GetMapping("/me/financeiro")
    @PreAuthorize("hasAuthority('ARTESAO')")
    public ResponseEntity<FinanceiroArtesaoResponse> meuFinanceiro() {
        return ResponseEntity.ok(financeiroArtesaoService.calcularFinanceiro());
    }
}
