package br.com.catalog.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_artesao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artesao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(name = "nome_atelie", length = 150)
    private String nomeAtelie;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Column(name = "telefone_whatsapp", length = 20)
    private String telefoneWhatsapp;

    @Builder.Default
    private Boolean ativo = true;

    @Builder.Default
    @Column(name = "selo_verificado")
    private Boolean seloVerificado = false;

    @Builder.Default
    @Column(name = "senha_temporaria")
    private Boolean senhaTemporaria = false;

    @Column(name = "codigo_recuperacao", length = 6)
    private String codigoRecuperacao;

    @Column(name = "validade_codigo")
    private LocalDateTime validadeCodigo;

    @Builder.Default
    @Column(name = "email_verificado")
    private Boolean emailVerificado = false;

    @Column(name = "codigo_verificacao", length = 6)
    private String codigoVerificacao;

    @Column(nullable = false, length = 9)
    private String cep;

    @Column(length = 2)
    private String estado;

    @Column(length = 100)
    private String cidade;

    @Builder.Default
    @Column(name = "saldo_rendimentos", precision = 10, scale = 2)
    private BigDecimal saldoRendimentos = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "config_confirmacao_leitura")
    private Boolean configConfirmacaoLeitura = true;

    @Column(name = "mp_user_id", length = 100)
    private String mpUserId;

    @Column(name = "mp_access_token")
    private String mpAccessToken;

    @Column(name = "me_access_token")
    private String meAccessToken;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @Builder.Default
    @OneToMany(mappedBy = "artesao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produto> produtos = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "artesao")
    private List<EncomendaPersonalizada> encomendas = new ArrayList<>();
}
