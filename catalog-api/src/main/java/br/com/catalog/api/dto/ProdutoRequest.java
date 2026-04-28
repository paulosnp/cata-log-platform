package br.com.catalog.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoRequest {

    @NotBlank
    private String nome;

    private String descricao;

    @NotNull
    @Positive
    private BigDecimal preco;

    @NotNull
    private Long categoriaId;

    private Boolean pecaUnica;

    private String material;

    private Integer pesoGramas;

    private Integer comprimentoCm;

    private Integer larguraCm;

    private Integer alturaCm;

    private Integer tempoProducaoDias;
}
