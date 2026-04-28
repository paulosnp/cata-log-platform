package br.com.catalog.api.repository;

import br.com.catalog.api.model.Artesao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtesaoRepository extends JpaRepository<Artesao, Long> {

    Optional<Artesao> findByEmail(String email);
}
