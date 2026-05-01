package br.com.catalog.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoResponse {

    private Long id;
    private String statusPagamento;
    private String statusEntrega;
    private BigDecimal valorTotal;
    private BigDecimal taxaPlataforma;
    private BigDecimal valorLiquidoArtesao;
    private List<ItemPedidoResponse> itens;
    private LocalDateTime criadoEm;
}
