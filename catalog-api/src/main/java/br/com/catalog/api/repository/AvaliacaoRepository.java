package br.com.catalog.api.repository;

import br.com.catalog.api.model.Avaliacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    Page<Avaliacao> findByProdutoIdOrderByDataAvaliacaoDesc(Long produtoId, Pageable pageable);

    boolean existsByProdutoIdAndCompradorId(Long produtoId, Long compradorId);

    @Query("SELECT COALESCE(AVG(a.nota), 0) FROM Avaliacao a WHERE a.produto.id = :produtoId")
    Double calcularMediaPorProdutoId(Long produtoId);

    @Query("SELECT COUNT(a) FROM Avaliacao a WHERE a.produto.id = :produtoId")
    Integer contarPorProdutoId(Long produtoId);
}
