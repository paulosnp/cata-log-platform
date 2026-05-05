package br.com.catalog.api.dto.admin;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaturamentoResponse {

    private BigDecimal totalFaturamento;
    private BigDecimal taxaPlataforma;
    private Long totalPedidos;
}
