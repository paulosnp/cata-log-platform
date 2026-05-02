package br.com.catalog.api.repository;

import br.com.catalog.api.model.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByAtivoTrue();

    Optional<Categoria> findByNome(String nome);

    Page<Categoria> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome, Pageable pageable);

    Page<Categoria> findByAtivoTrue(Pageable pageable);
}
