package br.com.catalog.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * Registro de auditoria IMUTÁVEL — protegido por triggers no banco (V9)
 * e por @Immutable no Hibernate.
 */
@Entity
@Immutable
@Table(name = "tb_log_auditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artesao_id")
    private Artesao artesao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id")
    private Comprador comprador;

    @Column(nullable = false)
    private String acao;

    @Column(name = "entidade_afetada", length = 100)
    private String entidadeAfetada;

    @Column(name = "entidade_id")
    private Long entidadeId;

    @Column(columnDefinition = "TEXT")
    private String detalhes;

    @CreationTimestamp
    @Column(name = "data_hora", nullable = false, updatable = false)
    private LocalDateTime dataHora;
}
