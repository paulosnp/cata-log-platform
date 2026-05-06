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
public class GerarEnvioRequest {

    @NotNull(message = "ID do pedido é obrigatório")
    private Long pedidoId;

    @NotNull(message = "ID do serviço (transportadora) é obrigatório")
    private Integer servicoId;

    @NotBlank(message = "Nome do destinatário é obrigatório")
    private String nomeDestinatario;

    @NotBlank(message = "Endereço do destinatário é obrigatório")
    private String enderecoDestinatario;

    @NotBlank(message = "Cidade do destinatário é obrigatória")
    private String cidadeDestinatario;

    @NotBlank(message = "Estado do destinatário é obrigatório")
    private String estadoDestinatario;

    @NotBlank(message = "CEP do destinatário é obrigatório")
    private String cepDestinatario;

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
