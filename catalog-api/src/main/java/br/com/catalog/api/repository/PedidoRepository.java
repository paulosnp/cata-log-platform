package br.com.catalog.api.repository;

import br.com.catalog.api.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
}
