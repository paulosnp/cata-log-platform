package br.com.catalog.api.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompradorAdminResponse {

    private Long id;
    private String nome;
    private String email;
    private String cpf;
    private String cidade;
    private String estado;
    private Boolean ativo;
    private LocalDateTime criadoEm;
}
