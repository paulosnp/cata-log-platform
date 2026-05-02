package br.com.catalog.api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtesaoVitrineResponse {

    private Long id;
    private String nomeAtelie;
    private String biografia;
    private String cidade;
    private String estado;
    private Boolean seloVerificado;
}
