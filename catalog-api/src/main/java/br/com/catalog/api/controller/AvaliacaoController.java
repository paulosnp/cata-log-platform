package br.com.catalog.api.controller;

import br.com.catalog.api.dto.AvaliacaoRequest;
import br.com.catalog.api.dto.AvaliacaoResponse;
import br.com.catalog.api.service.AvaliacaoService;
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
@RequestMapping("/api/v1/produtos/{produtoId}/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @PostMapping
    @PreAuthorize("hasAuthority('COMPRADOR')")
    public ResponseEntity<AvaliacaoResponse> avaliarProduto(
            @PathVariable Long produtoId,
            @RequestBody @Valid AvaliacaoRequest request) {
        AvaliacaoResponse response = avaliacaoService.avaliarProduto(produtoId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<AvaliacaoResponse>> listarAvaliacoes(
            @PathVariable Long produtoId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(avaliacaoService.listarAvaliacoesDoProduto(produtoId, pageable));
    }
}
