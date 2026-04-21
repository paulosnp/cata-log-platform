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

    // --- Autenticação ---

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    // --- Perfil do Ateliê ---

    @Column(name = "nome_atelie", length = 150)
    private String nomeAtelie;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Column(name = "telefone_whatsapp", length = 20)
    private String telefoneWhatsapp;

    // --- Controle ---

    @Builder.Default
    private Boolean ativo = true;

    @Builder.Default
    @Column(name = "selo_verificado")
    private Boolean seloVerificado = false;

    // --- Recuperação de Senha ---

    @Builder.Default
    @Column(name = "senha_temporaria")
    private Boolean senhaTemporaria = false;

    @Column(name = "codigo_recuperacao", length = 6)
    private String codigoRecuperacao;

    @Column(name = "validade_codigo")
    private LocalDateTime validadeCodigo;

    // --- Validação de Email ---

    @Builder.Default
    @Column(name = "email_verificado")
    private Boolean emailVerificado = false;

    @Column(name = "codigo_verificacao", length = 6)
    private String codigoVerificacao;

    // --- Dados Logísticos ---

    @Column(nullable = false, length = 9)
    private String cep;

    @Column(length = 2)
    private String estado;

    @Column(length = 100)
    private String cidade;

    // --- Dashboard Financeiro ---

    @Builder.Default
    @Column(name = "saldo_rendimentos", precision = 10, scale = 2)
    private BigDecimal saldoRendimentos = BigDecimal.ZERO;

    // --- Privacidade ---

    @Builder.Default
    @Column(name = "config_confirmacao_leitura")
    private Boolean configConfirmacaoLeitura = true;

    // --- Integração Mercado Pago ---

    @Column(name = "mp_user_id", length = 100)
    private String mpUserId;

    @Column(name = "mp_access_token")
    private String mpAccessToken;

    // --- Integração Melhor Envio ---

    @Column(name = "me_access_token")
    private String meAccessToken;

    // --- Auditoria ---

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // --- Relacionamentos ---

    @Builder.Default
    @OneToMany(mappedBy = "artesao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produto> produtos = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "artesao")
    private List<EncomendaPersonalizada> encomendas = new ArrayList<>();
}
