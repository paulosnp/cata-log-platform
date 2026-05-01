package br.com.catalog.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_item_carrinho",
        uniqueConstraints = @UniqueConstraint(columnNames = {"carrinho_id", "produto_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrinho_id", nullable = false)
    private Carrinho carrinho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Builder.Default
    @Column(nullable = false)
    private Integer quantidade = 1;
}
