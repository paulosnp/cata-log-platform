package br.com.catalog.api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaResponse {

    private Long id;
    private String nome;
    private String descricao;
    private Boolean ativo;
}
