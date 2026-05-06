package br.com.catalog.api.service;

import br.com.catalog.api.dto.logistica.CotacaoFreteRequest;
import br.com.catalog.api.dto.logistica.GerarEnvioRequest;
import br.com.catalog.api.dto.logistica.GerarEnvioResponse;
import br.com.catalog.api.dto.logistica.OpcaoFreteResponse;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.Pedido;
import br.com.catalog.api.model.enums.StatusEntrega;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.PedidoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogisticaService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final PedidoRepository pedidoRepository;
    private final ArtesaoRepository artesaoRepository;

    @Value("${melhorenvio.token:}")
    private String melhorEnvioToken;

    private static final String BASE_URL = "https://sandbox.melhorenvio.com.br/api/v2/me";

    // ======================== COTAÇÃO (Sprint 17) ========================

    public List<OpcaoFreteResponse> calcularFrete(CotacaoFreteRequest request) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("from", Map.of("postal_code", limparCep(request.getCepOrigem())));
            body.put("to", Map.of("postal_code", limparCep(request.getCepDestino())));
            body.put("package", Map.of(
                    "height", request.getAltura(),
                    "width", request.getLargura(),
                    "length", request.getComprimento(),
                    "weight", request.getPeso()
            ));

            log.info("Cotação de frete: {} → {}", request.getCepOrigem(), request.getCepDestino());

            String responseBody = executarPost(BASE_URL + "/shipment/calculate", body);
            return parseCotacaoResponse(responseBody);

        } catch (RestClientException e) {
            log.error("Erro de conexão com API do Melhor Envio: {}", e.getMessage());
            throw new RuntimeException("Serviço de frete temporariamente indisponível.");
        } catch (Exception e) {
            log.error("Erro ao calcular frete: {}", e.getMessage());
            throw new RuntimeException("Erro ao processar cotação de frete: " + e.getMessage());
        }
    }

    // ======================== ENVIO COMPLETO (Sprint 17.1) ========================

    public GerarEnvioResponse gerarEnvioCompleto(GerarEnvioRequest request) {
        Artesao artesao = getArtesaoLogado();
        Pedido pedido = pedidoRepository.findById(request.getPedidoId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado com ID: " + request.getPedidoId()));

        try {
            // Passo 1: Inserir no carrinho do Melhor Envio
            String shipmentId = inserirNoCarrinho(request, artesao);
            log.info("Passo 1/4 — Frete inserido no carrinho ME: {}", shipmentId);

            // Passo 2: Comprar o frete (debita saldo ME)
            comprarFrete(shipmentId);
            log.info("Passo 2/4 — Frete comprado com sucesso: {}", shipmentId);

            // Passo 3: Gerar a etiqueta
            String codigoRastreio = gerarEtiqueta(shipmentId);
            log.info("Passo 3/4 — Etiqueta gerada. Rastreio: {}", codigoRastreio);

            // Passo 4: Obter URL de impressão
            String urlEtiqueta = imprimirEtiqueta(shipmentId);
            log.info("Passo 4/4 — URL da etiqueta: {}", urlEtiqueta);

            // Atualizar o pedido no banco
            pedido.setCodigoRastreioMe(codigoRastreio);
            pedido.setStatusEntrega(StatusEntrega.ENVIADO);
            pedidoRepository.save(pedido);

            log.info("Envio completo para Pedido #{}: rastreio={}", pedido.getId(), codigoRastreio);

            return GerarEnvioResponse.builder()
                    .shipmentId(shipmentId)
                    .codigoRastreio(codigoRastreio)
                    .urlEtiqueta(urlEtiqueta)
                    .status("ENVIADO")
                    .build();

        } catch (RestClientException e) {
            log.error("Erro de conexão com Melhor Envio no envio do Pedido #{}: {}", request.getPedidoId(), e.getMessage());
            throw new RuntimeException("Serviço de envio temporariamente indisponível: " + e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao gerar envio para Pedido #{}: {}", request.getPedidoId(), e.getMessage());
            throw new RuntimeException("Falha ao gerar envio: " + e.getMessage());
        }
    }

    // ======================== PASSOS DO MELHOR ENVIO ========================

    /**
     * Passo 1: POST /api/v2/me/cart
     * Insere o frete no carrinho do Melhor Envio.
     * Retorna o ID do shipment criado.
     */
    private String inserirNoCarrinho(GerarEnvioRequest request, Artesao artesao) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", request.getServicoId());

        body.put("from", Map.of(
                "name", artesao.getNomeAtelie() != null ? artesao.getNomeAtelie() : "Ateliê",
                "postal_code", limparCep(artesao.getCep()),
                "city", artesao.getCidade() != null ? artesao.getCidade() : "",
                "state_abbr", artesao.getEstado() != null ? artesao.getEstado() : ""
        ));

        body.put("to", Map.of(
                "name", request.getNomeDestinatario(),
                "postal_code", limparCep(request.getCepDestinatario()),
                "address", request.getEnderecoDestinatario(),
                "city", request.getCidadeDestinatario(),
                "state_abbr", request.getEstadoDestinatario()
        ));

        body.put("products", List.of(Map.of(
                "name", "Pedido Cata Log #" + request.getPedidoId(),
                "quantity", 1,
                "unitary_value", 1.00
        )));

        body.put("volumes", List.of(Map.of(
                "height", request.getAltura(),
                "width", request.getLargura(),
                "length", request.getComprimento(),
                "weight", request.getPeso()
        )));

        String responseBody = executarPost(BASE_URL + "/cart", body);
        return extrairCampo(responseBody, "id");
    }

    /**
     * Passo 2: POST /api/v2/me/shipment/checkout
     * Efetiva a compra do frete (debita saldo da conta ME).
     */
    private void comprarFrete(String shipmentId) {
        Map<String, Object> body = Map.of("orders", List.of(shipmentId));
        executarPost(BASE_URL + "/shipment/checkout", body);
    }

    /**
     * Passo 3: POST /api/v2/me/shipment/generate
     * Gera a etiqueta e o código de rastreio.
     */
    private String gerarEtiqueta(String shipmentId) {
        Map<String, Object> body = Map.of("orders", List.of(shipmentId));
        String responseBody = executarPost(BASE_URL + "/shipment/generate", body);

        try {
            JsonNode root = objectMapper.readTree(responseBody);

            // Tenta extrair o tracking de diferentes formatos de resposta
            if (root.isObject() && root.has(shipmentId)) {
                JsonNode shipment = root.get(shipmentId);
                if (shipment.has("tracking")) {
                    return shipment.get("tracking").asText();
                }
            }

            // Formato alternativo — array
            if (root.isArray()) {
                for (JsonNode node : root) {
                    if (node.has("tracking")) {
                        return node.get("tracking").asText();
                    }
                }
            }

            log.warn("Tracking não encontrado na resposta de generate. Usando shipmentId como fallback.");
            return shipmentId;

        } catch (Exception e) {
            log.warn("Erro ao extrair tracking: {}. Usando shipmentId.", e.getMessage());
            return shipmentId;
        }
    }

    /**
     * Passo 4: POST /api/v2/me/shipment/print
     * Retorna a URL do PDF da etiqueta para impressão.
     */
    private String imprimirEtiqueta(String shipmentId) {
        Map<String, Object> body = Map.of(
                "mode", "public",
                "orders", List.of(shipmentId)
        );

        String responseBody = executarPost(BASE_URL + "/shipment/print", body);

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            if (root.has("url")) {
                return root.get("url").asText();
            }
        } catch (Exception e) {
            log.warn("Erro ao extrair URL da etiqueta: {}", e.getMessage());
        }

        // Fallback: URL de impressão direta
        return BASE_URL.replace("/api/v2/me", "") + "/imprimir/pdf/" + shipmentId;
    }

    // ======================== MÉTODOS AUXILIARES ========================

    private HttpHeaders criarHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.setBearerAuth(melhorEnvioToken);
        headers.set("User-Agent", "CataLog App (contato@catalog.com)");
        return headers;
    }

    private String executarPost(String url, Map<String, Object> body) {
        try {
            String jsonBody = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, criarHeaders());

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

            throw new RuntimeException("Resposta inesperada do Melhor Envio: " + response.getStatusCode());

        } catch (RestClientException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erro na chamada ao Melhor Envio: " + e.getMessage());
        }
    }

    private String extrairCampo(String responseBody, String campo) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            if (root.has(campo)) {
                return root.get(campo).asText();
            }
        } catch (Exception e) {
            log.error("Erro ao extrair campo '{}': {}", campo, e.getMessage());
        }
        throw new RuntimeException("Campo '" + campo + "' não encontrado na resposta do Melhor Envio.");
    }

    private List<OpcaoFreteResponse> parseCotacaoResponse(String responseBody) {
        List<OpcaoFreteResponse> opcoes = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(responseBody);

            if (root.isArray()) {
                for (JsonNode node : root) {
                    JsonNode errorNode = node.get("error");
                    if (errorNode != null && !errorNode.isNull() && !errorNode.asText().isEmpty()) {
                        continue;
                    }

                    OpcaoFreteResponse opcao = OpcaoFreteResponse.builder()
                            .id(node.has("id") ? node.get("id").asInt() : null)
                            .nome(node.has("name") ? node.get("name").asText() : "Desconhecido")
                            .valor(node.has("price") ? node.get("price").asDouble() : 0.0)
                            .prazoDias(node.has("delivery_time") ? node.get("delivery_time").asInt() : 0)
                            .build();

                    opcoes.add(opcao);
                }
            }

            log.info("Cotação retornou {} opções de frete disponíveis", opcoes.size());

        } catch (Exception e) {
            log.error("Erro ao fazer parse da resposta do Melhor Envio: {}", e.getMessage());
        }

        return opcoes;
    }

    private String limparCep(String cep) {
        return cep != null ? cep.replaceAll("[^0-9]", "") : "";
    }

    private Artesao getArtesaoLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return artesaoRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Artesão não encontrado."));
    }
}
