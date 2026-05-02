package br.com.catalog.api.controller;

import br.com.catalog.api.dto.ItemDesejoResponse;
import br.com.catalog.api.service.ListaDesejoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/desejos")
@PreAuthorize("hasAuthority('COMPRADOR')")
@RequiredArgsConstructor
public class ListaDesejoController {

    private final ListaDesejoService listaDesejoService;

    @PostMapping("/{produtoId}")
    public ResponseEntity<ItemDesejoResponse> adicionarAosFavoritos(@PathVariable Long produtoId) {
        ItemDesejoResponse response = listaDesejoService.adicionarAosFavoritos(produtoId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{produtoId}")
    public ResponseEntity<Void> removerDosFavoritos(@PathVariable Long produtoId) {
        listaDesejoService.removerDosFavoritos(produtoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ItemDesejoResponse>> listarMeusFavoritos(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(listaDesejoService.listarMeusFavoritos(pageable));
    }
}
