package br.com.catalog.api.dto.logistica;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotacaoFreteRequest {

    @NotBlank(message = "CEP de origem é obrigatório")
    private String cepOrigem;

    @NotBlank(message = "CEP de destino é obrigatório")
    private String cepDestino;

    @NotNull(message = "Peso é obrigatório")
    @Min(value = 0, message = "Peso deve ser maior que zero")
    private Double peso;

    @NotNull(message = "Altura é obrigatória")
    @Min(value = 1, message = "Altura deve ser no mínimo 1 cm")
    private Integer altura;

    @NotNull(message = "Largura é obrigatória")
    @Min(value = 1, message = "Largura deve ser no mínimo 1 cm")
    private Integer largura;

    @NotNull(message = "Comprimento é obrigatório")
    @Min(value = 1, message = "Comprimento deve ser no mínimo 1 cm")
    private Integer comprimento;
}
