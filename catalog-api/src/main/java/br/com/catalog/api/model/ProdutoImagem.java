package br.com.catalog.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_produto_imagem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoImagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(name = "url_imagem", nullable = false, length = 500)
    private String urlImagem;

    @Builder.Default
    @Column(nullable = false)
    private Integer ordem = 1;
}
