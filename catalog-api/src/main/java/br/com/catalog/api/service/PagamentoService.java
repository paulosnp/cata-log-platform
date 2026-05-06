package br.com.catalog.api.service;

import br.com.catalog.api.model.Pedido;
import br.com.catalog.api.model.enums.StatusPagamento;
import br.com.catalog.api.repository.PedidoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PagamentoService {

    private final PedidoRepository pedidoRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${mercadopago.access-token}")
    private String accessToken;

    private static final String MP_API_URL = "https://api.mercadopago.com/v1/payments/";

    // ======================== CRIAR PREFERÊNCIA (Sprint 16) ========================

    public String criarPreferenciaPagamento(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado com ID: " + pedidoId));

        try {
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Pedido Cata Log #" + pedido.getId())
                    .quantity(1)
                    .unitPrice(pedido.getValorTotal())
                    .currencyId("BRL")
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:3000/pagamento/sucesso")
                    .failure("http://localhost:3000/pagamento/falha")
                    .pending("http://localhost:3000/pagamento/pendente")
                    .build();

            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(pedido.getId().toString())
                    .notificationUrl("https://seu-dominio.com/api/v1/webhooks/mercadopago")
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            log.info("Preferência criada para Pedido #{}: {}", pedidoId, preference.getInitPoint());

            return preference.getInitPoint();

        } catch (Exception e) {
            log.error("Erro ao criar preferência de pagamento para Pedido #{}: {}", pedidoId, e.getMessage());
            throw new RuntimeException("Falha ao gerar link de pagamento: " + e.getMessage());
        }
    }

    // ======================== PROCESSAR WEBHOOK (Sprint 16.1) ========================

    public void processarPagamento(String paymentId) {
        try {
            // Consultar API do Mercado Pago
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Consultando pagamento no MP: {}", paymentId);

            ResponseEntity<String> response = restTemplate.exchange(
                    MP_API_URL + paymentId,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("Resposta inesperada do MP para pagamento {}: {}", paymentId, response.getStatusCode());
                return;
            }

            // Parse da resposta
            JsonNode root = objectMapper.readTree(response.getBody());
            String status = root.has("status") ? root.get("status").asText() : null;
            String externalReference = root.has("external_reference") ? root.get("external_reference").asText() : null;

            if (status == null || externalReference == null) {
                log.warn("Campos 'status' ou 'external_reference' ausentes na resposta do MP.");
                return;
            }

            // Buscar pedido pelo external_reference (= ID do pedido)
            Long pedidoId = Long.parseLong(externalReference);
            Pedido pedido = pedidoRepository.findById(pedidoId).orElse(null);

            if (pedido == null) {
                log.warn("Pedido #{} não encontrado para pagamento MP {}", pedidoId, paymentId);
                return;
            }

            // Atualizar status do pagamento
            StatusPagamento novoStatus = mapearStatusMP(status);
            StatusPagamento statusAnterior = pedido.getStatusPagamento();
            pedido.setStatusPagamento(novoStatus);
            pedido.setIdTransacaoMp(paymentId);
            pedidoRepository.save(pedido);

            log.info("Pedido #{} atualizado: {} → {} (pagamento MP: {})",
                    pedidoId, statusAnterior, novoStatus, paymentId);

        } catch (NumberFormatException e) {
            log.error("external_reference inválido (não é número): {}", e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao processar pagamento {}: {}", paymentId, e.getMessage());
        }
    }

    // ======================== MAPEAMENTO DE STATUS ========================

    private StatusPagamento mapearStatusMP(String statusMP) {
        return switch (statusMP) {
            case "approved" -> StatusPagamento.APROVADO;
            case "rejected" -> StatusPagamento.RECUSADO;
            case "cancelled" -> StatusPagamento.CANCELADO;
            case "refunded", "charged_back" -> StatusPagamento.REEMBOLSADO;
            default -> StatusPagamento.PENDENTE;
        };
    }
}
