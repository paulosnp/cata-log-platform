package br.com.catalog.api.model;

import br.com.catalog.api.model.enums.StatusEntrega;
import br.com.catalog.api.model.enums.StatusPagamento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_pedido")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Comprador comprador;

    // --- Status ---

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", length = 50)
    private StatusPagamento statusPagamento = StatusPagamento.PENDENTE;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status_entrega", length = 50)
    private StatusEntrega statusEntrega = StatusEntrega.AGUARDANDO_ENVIO;

    // --- Integração Mercado Pago ---

    @Column(name = "id_transacao_mp", length = 100)
    private String idTransacaoMp;

    @Column(name = "codigo_rastreio_me", length = 100)
    private String codigoRastreioMe;

    // --- Valores Financeiros ---

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "taxa_plataforma", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaPlataforma;

    @Column(name = "valor_liquido_artesao", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorLiquidoArtesao;

    // --- Datas ---

    @Column(name = "data_entrega_realizada")
    private LocalDateTime dataEntregaRealizada;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // --- Itens ---

    @Builder.Default
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();
}
