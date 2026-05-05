package br.com.catalog.api.model;

import br.com.catalog.api.model.enums.PermissaoAdmin;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tb_admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Builder.Default
    @Column(name = "senha_temporaria")
    private Boolean senhaTemporaria = true;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tb_admin_permissao", joinColumns = @JoinColumn(name = "admin_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permissao")
    private Set<PermissaoAdmin> permissoes = new HashSet<>();

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
