package br.com.catalog.api.repository;

import br.com.catalog.api.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // RN-04: Vitrine pública — visibilidade em cascata
    @Query("SELECT p FROM Produto p " +
           "WHERE p.ativo = true " +
           "AND p.categoria.ativo = true " +
           "AND p.artesao.ativo = true")
    Page<Produto> findAllAtivosVitrine(Pageable pageable);

    // Meus produtos — artesão logado vê todos (inclusive inativos)
    Page<Produto> findByArtesaoId(Long artesaoId, Pageable pageable);

    // Filtro por categoria na vitrine
    @Query("SELECT p FROM Produto p " +
           "WHERE p.ativo = true " +
           "AND p.categoria.ativo = true " +
           "AND p.artesao.ativo = true " +
           "AND p.categoria.id = :categoriaId")
    Page<Produto> findAllAtivosVitrineByCategoriaId(Long categoriaId, Pageable pageable);
}
