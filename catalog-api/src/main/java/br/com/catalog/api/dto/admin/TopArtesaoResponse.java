package br.com.catalog.api.dto.admin;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopArtesaoResponse {

    private Long artesaoId;
    private String nomeArtesao;
    private BigDecimal totalVendido;
    private Long quantidadePedidos;
}
