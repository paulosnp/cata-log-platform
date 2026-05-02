package br.com.catalog.api.controller;

import br.com.catalog.api.dto.CarrinhoResponse;
import br.com.catalog.api.dto.ItemCarrinhoRequest;
import br.com.catalog.api.service.CarrinhoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/carrinho")
@PreAuthorize("hasAuthority('COMPRADOR')")
@RequiredArgsConstructor
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    @GetMapping
    public ResponseEntity<CarrinhoResponse> verCarrinho() {
        return ResponseEntity.ok(carrinhoService.verCarrinho());
    }

    @PostMapping("/itens")
    public ResponseEntity<CarrinhoResponse> adicionarItem(
            @RequestBody @Valid ItemCarrinhoRequest request) {
        return ResponseEntity.ok(carrinhoService.adicionarItem(request));
    }

    @DeleteMapping("/itens/{produtoId}")
    public ResponseEntity<CarrinhoResponse> removerItem(@PathVariable Long produtoId) {
        return ResponseEntity.ok(carrinhoService.removerItem(produtoId));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> limparCarrinho() {
        carrinhoService.limparCarrinho();
        return ResponseEntity.ok(Map.of("mensagem", "Carrinho limpo com sucesso."));
    }
}
