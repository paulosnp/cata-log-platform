package br.com.catalog.api.dto.encomenda;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EncomendaResponse {

    private Long id;
    private String status;
    private String observacoesCliente;
    private BigDecimal precoProposto;
    private Integer tempoProducaoDias;
    private String streamChannelId;

    private Long compradorId;
    private String nomeComprador;

    private Long artesaoId;
    private String nomeArtesao;

    private Long produtoReferenciaId;
    private String nomeProdutoReferencia;

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
