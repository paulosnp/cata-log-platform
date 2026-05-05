package br.com.catalog.api.dto.admin;

import br.com.catalog.api.model.enums.PermissaoAdmin;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminResponse {

    private Long id;
    private String email;
    private Boolean senhaTemporaria;
    private Set<PermissaoAdmin> permissoes;
    private LocalDateTime criadoEm;
}
