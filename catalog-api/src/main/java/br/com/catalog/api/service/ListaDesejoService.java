package br.com.catalog.api.service;

import br.com.catalog.api.dto.ItemDesejoResponse;
import br.com.catalog.api.exception.FavoritoDuplicadoException;
import br.com.catalog.api.exception.ProdutoNaoEncontradoException;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.model.ListaDesejo;
import br.com.catalog.api.model.Produto;
import br.com.catalog.api.repository.CompradorRepository;
import br.com.catalog.api.repository.ListaDesejoRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import br.com.catalog.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ListaDesejoService {

    private final ListaDesejoRepository listaDesejoRepository;
    private final ProdutoRepository produtoRepository;
    private final CompradorRepository compradorRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public ItemDesejoResponse adicionarAosFavoritos(Long produtoId) {
        Long compradorId = securityUtils.getUsuarioLogadoId();

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(produtoId));

        if (listaDesejoRepository.existsByCompradorIdAndProdutoId(compradorId, produtoId)) {
            throw new FavoritoDuplicadoException();
        }

        Comprador comprador = compradorRepository.findById(compradorId)
                .orElseThrow(() -> new IllegalArgumentException("Comprador não encontrado."));

        ListaDesejo item = ListaDesejo.builder()
                .comprador(comprador)
                .produto(produto)
                .build();

        ListaDesejo salvo = listaDesejoRepository.save(item);
        return toResponse(salvo);
    }

    @Transactional
    public void removerDosFavoritos(Long produtoId) {
        Long compradorId = securityUtils.getUsuarioLogadoId();
        listaDesejoRepository.deleteByCompradorIdAndProdutoId(compradorId, produtoId);
    }

    @Transactional(readOnly = true)
    public Page<ItemDesejoResponse> listarMeusFavoritos(Pageable pageable) {
        Long compradorId = securityUtils.getUsuarioLogadoId();
        return listaDesejoRepository.findByCompradorIdOrderByDataAdicaoDesc(compradorId, pageable)
                .map(this::toResponse);
    }

    private ItemDesejoResponse toResponse(ListaDesejo item) {
        Produto p = item.getProduto();

        String imagemUrl = (p.getImagens() != null && !p.getImagens().isEmpty())
                ? p.getImagens().get(0).getUrlImagem()
                : null;

        return ItemDesejoResponse.builder()
                .produtoId(p.getId())
                .nomeProduto(p.getNome())
                .precoAtual(p.getPreco())
                .imagemUrl(imagemUrl)
                .dataAdicao(item.getDataAdicao())
                .build();
    }
}
