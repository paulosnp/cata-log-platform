package br.com.catalog.api.repository;

import br.com.catalog.api.model.LogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

    @Query("""
        SELECT l FROM LogAuditoria l
        LEFT JOIN FETCH l.admin
        WHERE (:acao IS NULL OR l.acao = :acao)
          AND (:adminId IS NULL OR l.admin.id = :adminId)
          AND (cast(:inicio as timestamp) IS NULL OR l.dataHora >= :inicio)
          AND (cast(:fim as timestamp) IS NULL OR l.dataHora <= :fim)
        ORDER BY l.dataHora DESC
    """)
    Page<LogAuditoria> buscarComFiltros(
            @Param("acao") String acao,
            @Param("adminId") Long adminId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            Pageable pageable
    );
}
