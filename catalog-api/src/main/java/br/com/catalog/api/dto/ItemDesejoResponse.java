package br.com.catalog.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDesejoResponse {

    private Long produtoId;
    private String nomeProduto;
    private BigDecimal precoAtual;
    private String imagemUrl;
    private LocalDateTime dataAdicao;
}
