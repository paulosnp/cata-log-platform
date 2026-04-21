package br.com.catalog.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_comprador")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comprador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Autenticação ---

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(unique = true, length = 14)
    private String cpf;

    // --- Contato & Logística ---

    @Column(name = "telefone_whatsapp", length = 20)
    private String telefoneWhatsapp;

    @Column(nullable = false, length = 9)
    private String cep;

    private String endereco;

    @Column(length = 20)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(length = 100)
    private String bairro;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String estado;

    // --- Controle ---

    @Builder.Default
    private Boolean ativo = true;

    @Builder.Default
    @Column(name = "email_verificado")
    private Boolean emailVerificado = false;

    @Column(name = "codigo_verificacao", length = 6)
    private String codigoVerificacao;

    @Builder.Default
    @Column(name = "config_confirmacao_leitura")
    private Boolean configConfirmacaoLeitura = true;

    // --- Auditoria ---

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // --- Relacionamentos ---

    @Builder.Default
    @OneToMany(mappedBy = "comprador")
    private List<Pedido> pedidos = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "comprador")
    private List<EncomendaPersonalizada> encomendas = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "comprador", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ListaDesejo> listaDesejos = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "comprador")
    private List<Avaliacao> avaliacoes = new ArrayList<>();
}
