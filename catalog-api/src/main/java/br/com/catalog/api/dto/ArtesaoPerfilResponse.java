package br.com.catalog.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtesaoPerfilResponse {
    private Long id;
    private String email;
    private String nomeAtelie;
    private String biografia;
    private String telefoneWhatsapp;
    private String cep;
    private String estado;
    private String cidade;
    private Boolean seloVerificado;
    private Boolean emailVerificado;
    private String fotoUrl;
    private String criadoEm;
}
