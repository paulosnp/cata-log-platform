package br.com.catalog.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarPerfilRequest {
    private String nomeAtelie;
    private String biografia;
    private String telefoneWhatsapp;
    private String cep;
}
