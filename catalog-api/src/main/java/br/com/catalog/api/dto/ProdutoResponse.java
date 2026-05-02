package br.com.catalog.api.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoResponse {

    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private BigDecimal precoComDesconto;
    private Integer percentualDesconto;
    private Boolean emPromocao;
    private Boolean pecaUnica;
    private Boolean vendido;
    private Boolean ativo;
    private String material;
    private Integer pesoGramas;
    private Integer comprimentoCm;
    private Integer larguraCm;
    private Integer alturaCm;
    private Integer tempoProducaoDias;
    private String categoriaNome;
    private Long categoriaId;
    private String artesaoNomeAtelie;
    private Long artesaoId;
    private Boolean artesaoSeloVerificado;
    private Double notaMedia;
    private Integer totalAvaliacoes;
    private List<String> imagensUrls;
    private LocalDateTime criadoEm;
}
