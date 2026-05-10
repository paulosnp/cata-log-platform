package br.com.catalog.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long id;
    private String token;
    private String role;
    private String nome;

    // RN-02: Flag para o frontend interceptar e redirecionar para troca de senha obrigatória
    private boolean senhaTemporaria;
}
