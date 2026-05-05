package br.com.catalog.api.repository;

import br.com.catalog.api.model.Pedido;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByCompradorIdOrderByCriadoEmDesc(Long compradorId);

    @Query("SELECT CASE WHEN COUNT(ip) > 0 THEN true ELSE false END " +
           "FROM ItemPedido ip " +
           "WHERE ip.pedido.comprador.id = :compradorId " +
           "AND ip.produto.id = :produtoId " +
           "AND ip.pedido.statusPagamento <> br.com.catalog.api.model.enums.StatusPagamento.CANCELADO")
    boolean existsCompraByCompradorIdAndProdutoId(Long compradorId, Long produtoId);

    // ===================== RELATÓRIOS ADMIN =====================

    @Query("SELECT COALESCE(SUM(p.valorTotal), 0) " +
           "FROM Pedido p " +
           "WHERE p.statusPagamento = br.com.catalog.api.model.enums.StatusPagamento.APROVADO " +
           "AND p.criadoEm BETWEEN :inicio AND :fim")
    BigDecimal somarFaturamentoPorPeriodo(@Param("inicio") LocalDateTime inicio,
                                         @Param("fim") LocalDateTime fim);

    @Query("SELECT COALESCE(SUM(p.taxaPlataforma), 0) " +
           "FROM Pedido p " +
           "WHERE p.statusPagamento = br.com.catalog.api.model.enums.StatusPagamento.APROVADO " +
           "AND p.criadoEm BETWEEN :inicio AND :fim")
    BigDecimal somarTaxaPlataformaPorPeriodo(@Param("inicio") LocalDateTime inicio,
                                            @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(p) " +
           "FROM Pedido p " +
           "WHERE p.statusPagamento = br.com.catalog.api.model.enums.StatusPagamento.APROVADO " +
           "AND p.criadoEm BETWEEN :inicio AND :fim")
    Long contarPedidosAprovadosPorPeriodo(@Param("inicio") LocalDateTime inicio,
                                         @Param("fim") LocalDateTime fim);

    @Query("SELECT ip.produto.artesao.id, " +
           "       ip.produto.artesao.nomeAtelie, " +
           "       SUM(ip.precoUnitario * ip.quantidade), " +
           "       COUNT(DISTINCT ip.pedido) " +
           "FROM ItemPedido ip " +
           "WHERE ip.pedido.statusPagamento = br.com.catalog.api.model.enums.StatusPagamento.APROVADO " +
           "GROUP BY ip.produto.artesao.id, ip.produto.artesao.nomeAtelie " +
           "ORDER BY SUM(ip.precoUnitario * ip.quantidade) DESC")
    List<Object[]> buscarTopArtesaosPorVendas(Pageable pageable);
}
