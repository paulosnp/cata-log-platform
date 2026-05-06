package br.com.catalog.api.controller;

import br.com.catalog.api.service.PagamentoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final PagamentoService pagamentoService;

    @PostMapping("/mercadopago")
    public ResponseEntity<Void> receberNotificacaoMercadoPago(
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(name = "data.id", required = false) String dataId) {

        log.info("Webhook MP recebido — type: {}, data.id: {}", type, dataId);

        // Processar apenas notificações de pagamento
        if ("payment".equals(type) && dataId != null) {
            try {
                pagamentoService.processarPagamento(dataId);
            } catch (Exception e) {
                // Loga o erro mas NÃO propaga — MP exige 200 OK rápido
                log.error("Erro ao processar webhook de pagamento: {}", e.getMessage());
            }
        }

        // SEMPRE retorna 200 OK — MP reenvia se não receber
        return ResponseEntity.ok().build();
    }
}
