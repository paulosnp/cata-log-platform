package br.com.catalog.api.dto.logistica;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpcaoFreteResponse {

    private Integer id;
    private String nome;
    private Double valor;
    private Integer prazoDias;
}
