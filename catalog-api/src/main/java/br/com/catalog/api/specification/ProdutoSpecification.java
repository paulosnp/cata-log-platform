package br.com.catalog.api.specification;

import br.com.catalog.api.model.Produto;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProdutoSpecification {

    private ProdutoSpecification() {}

    public static Specification<Produto> isAtivo() {
        return (root, query, cb) -> cb.isTrue(root.get("ativo"));
    }

    public static Specification<Produto> categoriaAtiva() {
        return (root, query, cb) -> cb.isTrue(root.get("categoria").get("ativo"));
    }

    public static Specification<Produto> artesaoAtivo() {
        return (root, query, cb) -> cb.isTrue(root.get("artesao").get("ativo"));
    }

    public static Specification<Produto> isNaoVendido() {
        return (root, query, cb) -> cb.isFalse(root.get("vendido"));
    }

    public static Specification<Produto> nomeContains(String termo) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("nome")), "%" + termo.toLowerCase() + "%");
    }

    public static Specification<Produto> categoriaIdEquals(Long categoriaId) {
        return (root, query, cb) ->
                cb.equal(root.get("categoria").get("id"), categoriaId);
    }

    public static Specification<Produto> precoMinimo(BigDecimal precoMin) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("preco"), precoMin);
    }

    public static Specification<Produto> precoMaximo(BigDecimal precoMax) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("preco"), precoMax);
    }

    /**
     * Compõe a Specification base da vitrine (RN-04):
     * produto ativo + categoria ativa + artesão ativo + não vendido
     */
    public static Specification<Produto> vitrineBase() {
        return Specification
                .where(isAtivo())
                .and(categoriaAtiva())
                .and(artesaoAtivo())
                .and(isNaoVendido());
    }
}
