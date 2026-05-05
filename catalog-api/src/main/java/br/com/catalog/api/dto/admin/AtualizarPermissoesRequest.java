package br.com.catalog.api.dto.admin;

import br.com.catalog.api.model.enums.PermissaoAdmin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtualizarPermissoesRequest {

    @NotNull
    private Set<PermissaoAdmin> permissoes;
}
