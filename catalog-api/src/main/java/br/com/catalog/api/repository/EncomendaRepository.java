package br.com.catalog.api.repository;

import br.com.catalog.api.model.EncomendaPersonalizada;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EncomendaRepository extends JpaRepository<EncomendaPersonalizada, Long> {

    Page<EncomendaPersonalizada> findByCompradorIdOrderByAtualizadoEmDesc(Long compradorId, Pageable pageable);

    Page<EncomendaPersonalizada> findByArtesaoIdOrderByAtualizadoEmDesc(Long artesaoId, Pageable pageable);
}
