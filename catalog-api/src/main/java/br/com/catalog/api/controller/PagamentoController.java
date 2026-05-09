package br.com.catalog.api.controller;

import br.com.catalog.api.service.PagamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/pagamentos")
@PreAuthorize("hasAuthority('COMPRADOR')")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    @PostMapping("/{pedidoId}")
    public ResponseEntity<Map<String, String>> gerarPagamento(@PathVariable Long pedidoId) {
        String initPoint = pagamentoService.criarPreferenciaPagamento(pedidoId);
        return ResponseEntity.ok(Map.of("paymentUrl", initPoint));
    }
}
