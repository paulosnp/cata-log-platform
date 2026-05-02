package br.com.catalog.api.controller;

import br.com.catalog.api.dto.encomenda.ContrapropostaRequest;
import br.com.catalog.api.dto.encomenda.EncomendaResponse;
import br.com.catalog.api.dto.encomenda.NovaEncomendaRequest;
import br.com.catalog.api.service.EncomendaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/encomendas")
@RequiredArgsConstructor
public class EncomendaController {

    private final EncomendaService encomendaService;

    @PostMapping
    @PreAuthorize("hasAuthority('COMPRADOR')")
    public ResponseEntity<EncomendaResponse> criarEncomenda(
            @RequestBody @Valid NovaEncomendaRequest request) {
        EncomendaResponse response = encomendaService.criarEncomenda(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/contraproposta")
    @PreAuthorize("hasAuthority('ARTESAO')")
    public ResponseEntity<EncomendaResponse> enviarContraproposta(
            @PathVariable Long id,
            @RequestBody @Valid ContrapropostaRequest request) {
        return ResponseEntity.ok(encomendaService.enviarContraproposta(id, request));
    }

    @PutMapping("/{id}/aceitar")
    @PreAuthorize("hasAuthority('COMPRADOR')")
    public ResponseEntity<EncomendaResponse> aceitarEncomenda(@PathVariable Long id) {
        return ResponseEntity.ok(encomendaService.aceitarEncomenda(id));
    }

    @GetMapping("/comprador")
    @PreAuthorize("hasAuthority('COMPRADOR')")
    public ResponseEntity<Page<EncomendaResponse>> listarEncomendasComprador(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(encomendaService.listarMinhasEncomendasComprador(pageable));
    }

    @GetMapping("/artesao")
    @PreAuthorize("hasAuthority('ARTESAO')")
    public ResponseEntity<Page<EncomendaResponse>> listarEncomendasArtesao(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(encomendaService.listarMinhasEncomendasArtesao(pageable));
    }
}
