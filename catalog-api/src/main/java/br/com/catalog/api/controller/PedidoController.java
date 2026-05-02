package br.com.catalog.api.controller;

import br.com.catalog.api.dto.PedidoResponse;
import br.com.catalog.api.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
@PreAuthorize("hasAuthority('COMPRADOR')")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping("/checkout")
    public ResponseEntity<PedidoResponse> realizarCheckout() {
        PedidoResponse pedido = pedidoService.realizarCheckout();
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<PedidoResponse>> listarMeusPedidos() {
        return ResponseEntity.ok(pedidoService.listarMeusPedidos());
    }
}
