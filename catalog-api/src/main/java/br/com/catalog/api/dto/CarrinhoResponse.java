package br.com.catalog.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarrinhoResponse {

    private Long id;
    private List<ItemCarrinhoResponse> itens;
    private BigDecimal valorTotal;
    private Integer totalItens;
}
