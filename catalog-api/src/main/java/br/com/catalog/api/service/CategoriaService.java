package br.com.catalog.api.service;

import br.com.catalog.api.dto.CategoriaRequest;
import br.com.catalog.api.dto.CategoriaResponse;
import br.com.catalog.api.exception.CategoriaNaoEncontradaException;
import br.com.catalog.api.model.Categoria;
import br.com.catalog.api.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public Page<CategoriaResponse> buscarPorNome(String nome, Pageable pageable) {
        Page<Categoria> categorias;

        if (nome != null && !nome.isBlank()) {
            categorias = categoriaRepository.findByNomeContainingIgnoreCaseAndAtivoTrue(nome, pageable);
        } else {
            categorias = categoriaRepository.findByAtivoTrue(pageable);
        }

        return categorias.map(this::toResponse);
    }

    public List<CategoriaResponse> listarAtivas() {
        return categoriaRepository.findByAtivoTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoriaResponse buscarPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new CategoriaNaoEncontradaException(id));
        return toResponse(categoria);
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        validarNomeUnico(request.getNome(), null);

        Categoria categoria = Categoria.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .build();

        Categoria salva = categoriaRepository.save(categoria);
        return toResponse(salva);
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new CategoriaNaoEncontradaException(id));

        validarNomeUnico(request.getNome(), id);

        categoria.setNome(request.getNome());
        categoria.setDescricao(request.getDescricao());

        Categoria salva = categoriaRepository.save(categoria);
        return toResponse(salva);
    }

    // RN-01: Soft Delete
    @Transactional
    public void deletar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new CategoriaNaoEncontradaException(id));
        categoria.setAtivo(false);
        categoriaRepository.save(categoria);
    }

    private void validarNomeUnico(String nome, Long idAtual) {
        categoriaRepository.findByNome(nome).ifPresent(existente -> {
            if (!existente.getId().equals(idAtual)) {
                throw new DataIntegrityViolationException("Já existe uma categoria com o nome: " + nome);
            }
        });
    }

    private CategoriaResponse toResponse(Categoria c) {
        return CategoriaResponse.builder()
                .id(c.getId())
                .nome(c.getNome())
                .descricao(c.getDescricao())
                .ativo(c.getAtivo())
                .build();
    }
}
