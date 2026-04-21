package br.com.catalog.api.model;

import br.com.catalog.api.model.enums.StatusEncomenda;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_encomenda_personalizada")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EncomendaPersonalizada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Atores ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Comprador comprador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artesao_id", nullable = false)
    private Artesao artesao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_referencia_id")
    private Produto produtoReferencia;

    // --- Detalhes da Negociação ---

    @Column(name = "observacoes_cliente", nullable = false, columnDefinition = "TEXT")
    private String observacoesCliente;

    @Column(name = "preco_proposto", precision = 10, scale = 2)
    private BigDecimal precoProposto;

    @Column(name = "tempo_producao_dias")
    private Integer tempoProducaoDias;

    // --- Máquina de Estados ---

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private StatusEncomenda status = StatusEncomenda.AGUARDANDO_ARTESAO;

    // --- Acordo & Escrow ---

    @Column(name = "data_aceite")
    private LocalDateTime dataAceite;

    /**
     * Valor retido em conta garantia (Escrow).
     * Representa 30% do preço acordado, retido até a conclusão da encomenda.
     */
    @Column(name = "valor_retido", precision = 10, scale = 2)
    private BigDecimal valorRetido;

    /**
     * Taxa de cancelamento (Fee).
     * Aplicada quando o cancelamento ocorre após o acordo de preço (CANCELADO_COM_TAXA).
     */
    @Column(name = "taxa_cancelamento", precision = 10, scale = 2)
    private BigDecimal taxaCancelamento;

    // --- Auditoria ---

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // --- Chat ---

    @Builder.Default
    @OneToMany(mappedBy = "encomenda", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dataEnvio ASC")
    private List<ChatEncomenda> mensagens = new ArrayList<>();
}
