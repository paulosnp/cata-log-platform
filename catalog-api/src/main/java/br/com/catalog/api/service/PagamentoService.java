package br.com.catalog.api.service;

import br.com.catalog.api.model.Pedido;
import br.com.catalog.api.repository.PedidoRepository;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PagamentoService {

    private final PedidoRepository pedidoRepository;

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
}
