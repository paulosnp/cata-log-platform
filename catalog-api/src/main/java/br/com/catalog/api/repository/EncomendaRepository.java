package br.com.catalog.api.repository;

import br.com.catalog.api.model.EncomendaPersonalizada;
import br.com.catalog.api.model.enums.StatusEncomenda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface EncomendaRepository extends JpaRepository<EncomendaPersonalizada, Long> {

    Page<EncomendaPersonalizada> findByCompradorIdOrderByAtualizadoEmDesc(Long compradorId, Pageable pageable);

    Page<EncomendaPersonalizada> findByArtesaoIdOrderByAtualizadoEmDesc(Long artesaoId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.valorRetido), 0) FROM EncomendaPersonalizada e " +
           "WHERE e.artesao.id = :artesaoId AND e.status IN :statuses")
    BigDecimal sumValorRetidoByArtesaoIdAndStatusIn(
            @Param("artesaoId") Long artesaoId,
            @Param("statuses") List<StatusEncomenda> statuses);
}
