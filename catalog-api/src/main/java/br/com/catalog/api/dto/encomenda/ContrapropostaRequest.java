package br.com.catalog.api.dto.encomenda;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContrapropostaRequest {

    @NotNull(message = "O preço proposto é obrigatório.")
    @Min(value = 1, message = "O preço deve ser maior que zero.")
    private BigDecimal precoProposto;

    @NotNull(message = "O prazo em dias é obrigatório.")
    @Min(value = 1, message = "O prazo deve ser de pelo menos 1 dia.")
    private Integer tempoProducaoDias;
}
