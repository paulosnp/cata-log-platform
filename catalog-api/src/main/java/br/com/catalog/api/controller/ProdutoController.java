package br.com.catalog.api.controller;

import br.com.catalog.api.dto.ProdutoRequest;
import br.com.catalog.api.dto.ProdutoResponse;
import br.com.catalog.api.dto.PromocaoRequest;
import br.com.catalog.api.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    // ======================== ROTAS PÚBLICAS ========================

    @GetMapping("/vitrine")
    public ResponseEntity<Page<ProdutoResponse>> buscarVitrine(
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(produtoService.buscarVitrine(termo, categoriaId, precoMin, precoMax, pageable));
    }

    @GetMapping
    public ResponseEntity<Page<ProdutoResponse>> listarVitrine(
            @RequestParam(required = false) Long categoriaId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ProdutoResponse> produtos = categoriaId != null
                ? produtoService.listarVitrinePorCategoria(categoriaId, pageable)
                : produtoService.listarVitrine(pageable);

        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    // ======================== ROTAS DO ARTESÃO ========================

    @GetMapping("/meus")
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<Page<ProdutoResponse>> listarMeusProdutos(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(produtoService.listarMeusProdutos(pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<ProdutoResponse> criarProduto(@RequestBody @Valid ProdutoRequest request) {
        ProdutoResponse produto = produtoService.criarProduto(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(produto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<ProdutoResponse> atualizarProduto(
            @PathVariable Long id,
            @RequestBody @Valid ProdutoRequest request) {
        return ResponseEntity.ok(produtoService.atualizarProduto(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<Map<String, String>> deletarProduto(@PathVariable Long id) {
        produtoService.deletarProduto(id);
        return ResponseEntity.ok(Map.of("mensagem", "Produto desativado com sucesso."));
    }

    @PatchMapping("/{id}/promocao")
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<ProdutoResponse> aplicarPromocao(
            @PathVariable Long id,
            @RequestBody @Valid PromocaoRequest request) {
        return ResponseEntity.ok(produtoService.aplicarPromocao(id, request));
    }

    @PatchMapping("/{id}/vendido")
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<ProdutoResponse> marcarVendido(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.marcarVendido(id));
    }

    // ======================== IMAGENS ========================

    @PostMapping(value = "/{id}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<ProdutoResponse> uploadImagem(
            @PathVariable Long id,
            @RequestParam("arquivo") MultipartFile arquivo) {
        ProdutoResponse response = produtoService.uploadImagem(id, arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/imagens/{imagemId}")
    @PreAuthorize("hasRole('ARTESAO')")
    public ResponseEntity<ProdutoResponse> removerImagem(
            @PathVariable Long id,
            @PathVariable Long imagemId) {
        return ResponseEntity.ok(produtoService.removerImagem(id, imagemId));
    }
}
