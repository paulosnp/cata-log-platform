package br.com.catalog.api.dto.encomenda;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NovaEncomendaRequest {

    @NotNull(message = "O ID do artesão é obrigatório.")
    private Long artesaoId;

    private Long produtoReferenciaId;

    @NotBlank(message = "A descrição do pedido é obrigatória.")
    private String observacoesCliente;
}
