package br.com.catalog.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinanceiroArtesaoResponse {

    private BigDecimal faturamentoMes;
    private BigDecimal faturamentoMesAnterior;
    private int totalVendasMes;
    private BigDecimal saldoDisponivel;
    private List<MovimentacaoResponse> movimentacoes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovimentacaoResponse {
        private String tipo;       // "VENDA" | "ENCOMENDA" | "TAXA"
        private String descricao;  // nome do produto / encomenda
        private String detalhe;    // "Venda direta" | "Encomenda — Nome"
        private BigDecimal valor;
        private String data;       // ISO date string
    }
}
