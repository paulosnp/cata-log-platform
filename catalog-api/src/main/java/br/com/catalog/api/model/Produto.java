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
@Table(name = "tb_produto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Builder.Default
    @Column(name = "percentual_desconto")
    private Integer percentualDesconto = 0;

    @Builder.Default
    @Column(name = "tempo_producao_dias")
    private Integer tempoProducaoDias = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artesao_id", nullable = false)
    private Artesao artesao;

    @Builder.Default
    private Boolean ativo = true;

    @Builder.Default
    @Column(name = "peca_unica")
    private Boolean pecaUnica = true;

    @Column(length = 100)
    private String material;

    @Column(name = "peso_gramas")
    private Integer pesoGramas;

    @Column(name = "comprimento_cm")
    private Integer comprimentoCm;

    @Column(name = "largura_cm")
    private Integer larguraCm;

    @Column(name = "altura_cm")
    private Integer alturaCm;

    @Builder.Default
    @Column(name = "em_promocao")
    private Boolean emPromocao = false;

    @Builder.Default
    private Boolean vendido = false;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @Builder.Default
    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<ProdutoImagem> imagens = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "produto")
    private List<Avaliacao> avaliacoes = new ArrayList<>();
}
