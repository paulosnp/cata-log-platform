package br.com.catalog.api.service;

import br.com.catalog.api.dto.AvaliacaoRequest;
import br.com.catalog.api.dto.AvaliacaoResponse;
import br.com.catalog.api.exception.AvaliacaoInvalidaException;
import br.com.catalog.api.exception.ProdutoNaoEncontradoException;
import br.com.catalog.api.model.Avaliacao;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.model.Produto;
import br.com.catalog.api.repository.AvaliacaoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import br.com.catalog.api.repository.PedidoRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import br.com.catalog.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final CompradorRepository compradorRepository;
    private final PedidoRepository pedidoRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public AvaliacaoResponse avaliarProduto(Long produtoId, AvaliacaoRequest request) {
        Long compradorId = securityUtils.getUsuarioLogadoId();

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(produtoId));

        Comprador comprador = compradorRepository.findById(compradorId)
                .orElseThrow(() -> new IllegalArgumentException("Comprador não encontrado."));

        // RN-COMPRA: Só avalia quem comprou
        boolean jaComprou = pedidoRepository.existsCompraByCompradorIdAndProdutoId(compradorId, produtoId);
        if (!jaComprou) {
            throw new AvaliacaoInvalidaException("Você precisa comprar este produto antes de avaliá-lo.");
        }

        // RN-11: Avaliação única por produto/comprador
        boolean jaAvaliou = avaliacaoRepository.existsByProdutoIdAndCompradorId(produtoId, compradorId);
        if (jaAvaliou) {
            throw new AvaliacaoInvalidaException("Você já avaliou este produto.");
        }

        Avaliacao avaliacao = Avaliacao.builder()
                .produto(produto)
                .comprador(comprador)
                .nota(request.getNota())
                .comentario(request.getComentario())
                .build();

        Avaliacao salva = avaliacaoRepository.save(avaliacao);

        // Atualizar cache de rating no Produto
        atualizarCacheRating(produto);

        return toResponse(salva);
    }

    public Page<AvaliacaoResponse> listarAvaliacoesDoProduto(Long produtoId, Pageable pageable) {
        return avaliacaoRepository.findByProdutoIdOrderByDataAvaliacaoDesc(produtoId, pageable)
                .map(this::toResponse);
    }

    private void atualizarCacheRating(Produto produto) {
        Double media = avaliacaoRepository.calcularMediaPorProdutoId(produto.getId());
        Integer total = avaliacaoRepository.contarPorProdutoId(produto.getId());

        // Arredondar para 2 casas decimais
        BigDecimal mediaArredondada = BigDecimal.valueOf(media)
                .setScale(2, RoundingMode.HALF_UP);

        produto.setNotaMedia(mediaArredondada);
        produto.setTotalAvaliacoes(total);
        produtoRepository.save(produto);
    }

    private AvaliacaoResponse toResponse(Avaliacao a) {
        return AvaliacaoResponse.builder()
                .id(a.getId())
                .nota(a.getNota())
                .comentario(a.getComentario())
                .nomeComprador(a.getComprador().getNome())
                .dataAvaliacao(a.getDataAvaliacao())
                .build();
    }
}
