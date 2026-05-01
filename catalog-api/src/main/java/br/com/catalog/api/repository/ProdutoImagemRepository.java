package br.com.catalog.api.repository;

import br.com.catalog.api.model.ProdutoImagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoImagemRepository extends JpaRepository<ProdutoImagem, Long> {

    int countByProdutoId(Long produtoId);
}
