package br.com.catalog.api.repository;

import br.com.catalog.api.model.ListaDesejo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListaDesejoRepository extends JpaRepository<ListaDesejo, Long> {

    Page<ListaDesejo> findByCompradorIdOrderByDataAdicaoDesc(Long compradorId, Pageable pageable);

    boolean existsByCompradorIdAndProdutoId(Long compradorId, Long produtoId);

    void deleteByCompradorIdAndProdutoId(Long compradorId, Long produtoId);
}
