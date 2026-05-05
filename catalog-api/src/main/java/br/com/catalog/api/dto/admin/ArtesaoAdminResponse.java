package br.com.catalog.api.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtesaoAdminResponse {

    private Long id;
    private String nomeAtelie;
    private String email;
    private String cep;
    private String cidade;
    private String estado;
    private Boolean seloVerificado;
    private Boolean ativo;
    private LocalDateTime criadoEm;
}
