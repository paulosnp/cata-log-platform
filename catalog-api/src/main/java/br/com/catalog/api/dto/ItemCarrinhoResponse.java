package br.com.catalog.api.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarrinhoResponse {

    private Long produtoId;
    private String produtoNome;
    private String imagemUrl;
    private BigDecimal precoUnitario;
    private Integer quantidade;
    private BigDecimal subtotal;
    private Boolean pecaUnica;
}
