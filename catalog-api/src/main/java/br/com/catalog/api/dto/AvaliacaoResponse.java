package br.com.catalog.api.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvaliacaoResponse {

    private Long id;
    private Integer nota;
    private String comentario;
    private String nomeComprador;
    private LocalDateTime dataAvaliacao;
}
