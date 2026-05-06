package br.com.catalog.api.controller;

import br.com.catalog.api.dto.logistica.CotacaoFreteRequest;
import br.com.catalog.api.dto.logistica.GerarEnvioRequest;
import br.com.catalog.api.dto.logistica.GerarEnvioResponse;
import br.com.catalog.api.dto.logistica.OpcaoFreteResponse;
import br.com.catalog.api.service.LogisticaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/logistica")
@RequiredArgsConstructor
public class LogisticaController {

    private final LogisticaService logisticaService;

    @PostMapping("/cotacao")
    @PreAuthorize("hasAuthority('COMPRADOR') or hasAuthority('ARTESAO')")
    public ResponseEntity<List<OpcaoFreteResponse>> calcularFrete(
            @RequestBody @Valid CotacaoFreteRequest request) {
        List<OpcaoFreteResponse> opcoes = logisticaService.calcularFrete(request);
        return ResponseEntity.ok(opcoes);
    }

    @PostMapping("/envio")
    @PreAuthorize("hasAuthority('ARTESAO')")
    public ResponseEntity<GerarEnvioResponse> gerarEnvio(
            @RequestBody @Valid GerarEnvioRequest request) {
        GerarEnvioResponse response = logisticaService.gerarEnvioCompleto(request);
        return ResponseEntity.ok(response);
    }
}
