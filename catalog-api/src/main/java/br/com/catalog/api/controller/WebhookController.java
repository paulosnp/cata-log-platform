package br.com.catalog.api.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@Slf4j
public class WebhookController {

    @PostMapping("/mercadopago")
    public ResponseEntity<Void> receberNotificacaoMercadoPago(
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) String type,
            @RequestParam(name = "data.id", required = false) String dataId) {

        log.info("=== WEBHOOK MERCADO PAGO RECEBIDO ===");
        log.info("Type: {}", type);
        log.info("Data ID: {}", dataId);
        log.info("Payload: {}", payload);
        log.info("=====================================");

        return ResponseEntity.ok().build();
    }
}
