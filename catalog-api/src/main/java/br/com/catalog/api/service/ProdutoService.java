package br.com.catalog.api.service;

import br.com.catalog.api.dto.ProdutoRequest;
import br.com.catalog.api.dto.ProdutoResponse;
import br.com.catalog.api.dto.PromocaoRequest;
import br.com.catalog.api.exception.AcessoNegadoException;
import br.com.catalog.api.exception.ProdutoNaoEncontradoException;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.Categoria;
import br.com.catalog.api.model.Produto;
import br.com.catalog.api.model.ProdutoImagem;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.CategoriaRepository;
import br.com.catalog.api.repository.ProdutoImagemRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import br.com.catalog.api.security.SecurityUtils;
import br.com.catalog.api.specification.ProdutoSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ArtesaoRepository artesaoRepository;
    private final ProdutoImagemRepository produtoImagemRepository;
    private final ArmazenamentoImagemService armazenamentoService;
    private final SecurityUtils securityUtils;

    @Value("${app.upload.max-images-per-product:5}")
    private int maxImagensPorProduto;

    // ======================== VITRINE PÚBLICA ========================

    @Transactional(readOnly = true)
    public Page<ProdutoResponse> listarVitrine(Pageable pageable) {
        return produtoRepository.findAllAtivosVitrine(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProdutoResponse> buscarVitrine(String termo, Long categoriaId,
                                               BigDecimal precoMin, BigDecimal precoMax,
                                               Pageable pageable) {
        Specification<Produto> spec = ProdutoSpecification.vitrineBase();

        if (termo != null && !termo.isBlank()) {
            spec = spec.and(ProdutoSpecification.nomeContains(termo));
        }
        if (categoriaId != null) {
            spec = spec.and(ProdutoSpecification.categoriaIdEquals(categoriaId));
        }
        if (precoMin != null) {
            spec = spec.and(ProdutoSpecification.precoMinimo(precoMin));
        }
        if (precoMax != null) {
            spec = spec.and(ProdutoSpecification.precoMaximo(precoMax));
        }

        return produtoRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProdutoResponse> listarVitrinePorCategoria(Long categoriaId, Pageable pageable) {
        return produtoRepository.findAllAtivosVitrineByCategoriaId(categoriaId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Long id) {
        Produto produto = buscarProdutoAtivo(id);
        return toResponse(produto);
    }

    // ======================== ARTESÃO LOGADO ========================

    @Transactional(readOnly = true)
    public Page<ProdutoResponse> listarMeusProdutos(Pageable pageable) {
        Long artesaoId = securityUtils.getUsuarioLogadoId();
        return produtoRepository.findByArtesaoId(artesaoId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ProdutoResponse criarProduto(ProdutoRequest request) {
        Long artesaoId = securityUtils.getUsuarioLogadoId();

        Artesao artesao = artesaoRepository.findById(artesaoId)
                .orElseThrow(() -> new AcessoNegadoException("Artesão não encontrado."));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));

        Produto produto = Produto.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .preco(request.getPreco())
                .categoria(categoria)
                .artesao(artesao)
                .pecaUnica(request.getPecaUnica() != null ? request.getPecaUnica() : true)
                .material(request.getMaterial())
                .pesoGramas(request.getPesoGramas())
                .comprimentoCm(request.getComprimentoCm())
                .larguraCm(request.getLarguraCm())
                .alturaCm(request.getAlturaCm())
                .tempoProducaoDias(request.getTempoProducaoDias() != null ? request.getTempoProducaoDias() : 0)
                .build();

        Produto salvo = produtoRepository.save(produto);
        return toResponse(salvo);
    }

    @Transactional
    public ProdutoResponse atualizarProduto(Long id, ProdutoRequest request) {
        Produto produto = buscarProdutoComValidacao(id);

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));

        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setCategoria(categoria);
        produto.setPecaUnica(request.getPecaUnica() != null ? request.getPecaUnica() : produto.getPecaUnica());
        produto.setMaterial(request.getMaterial());
        produto.setPesoGramas(request.getPesoGramas());
        produto.setComprimentoCm(request.getComprimentoCm());
        produto.setLarguraCm(request.getLarguraCm());
        produto.setAlturaCm(request.getAlturaCm());
        produto.setTempoProducaoDias(request.getTempoProducaoDias());

        Produto salvo = produtoRepository.save(produto);
        return toResponse(salvo);
    }

    // RN-01: Soft Delete — produto nunca é removido fisicamente
    @Transactional
    public void deletarProduto(Long id) {
        Produto produto = buscarProdutoComValidacao(id);
        produto.setAtivo(false);
        produtoRepository.save(produto);
    }

    // RN-06: Aplicar ou remover promoção com desconto
    @Transactional
    public ProdutoResponse aplicarPromocao(Long id, PromocaoRequest request) {
        Produto produto = buscarProdutoComValidacao(id);

        if (Boolean.TRUE.equals(request.getEmPromocao())) {
            if (request.getPercentualDesconto() == null || request.getPercentualDesconto() < 1) {
                throw new IllegalArgumentException("Percentual de desconto obrigatório para ativar promoção.");
            }
            produto.setEmPromocao(true);
            produto.setPercentualDesconto(request.getPercentualDesconto());
        } else {
            produto.setEmPromocao(false);
            produto.setPercentualDesconto(0);
        }

        Produto salvo = produtoRepository.save(produto);
        return toResponse(salvo);
    }

    // RN-05 / RN-17: Marcar peça única como vendida
    @Transactional
    public ProdutoResponse marcarVendido(Long id) {
        Produto produto = buscarProdutoComValidacao(id);

        if (!Boolean.TRUE.equals(produto.getPecaUnica())) {
            throw new IllegalArgumentException("Apenas peças únicas podem ser marcadas como vendidas.");
        }

        produto.setVendido(true);
        Produto salvo = produtoRepository.save(produto);
        return toResponse(salvo);
    }

    // ======================== UPLOAD DE IMAGENS ========================

    @Transactional
    public ProdutoResponse uploadImagem(Long produtoId, MultipartFile arquivo) {
        Produto produto = buscarProdutoComValidacao(produtoId);

        int totalImagens = produtoImagemRepository.countByProdutoId(produtoId);
        if (totalImagens >= maxImagensPorProduto) {
            throw new IllegalArgumentException(
                    "Limite de " + maxImagensPorProduto + " imagens por produto atingido."
            );
        }

        String url = armazenamentoService.salvar(arquivo);

        ProdutoImagem imagem = ProdutoImagem.builder()
                .produto(produto)
                .urlImagem(url)
                .ordem(totalImagens + 1)
                .build();

        produtoImagemRepository.save(imagem);

        Produto atualizado = produtoRepository.findById(produtoId).orElseThrow();
        return toResponse(atualizado);
    }

    @Transactional
    public ProdutoResponse removerImagem(Long produtoId, Long imagemId) {
        Produto produto = buscarProdutoComValidacao(produtoId);

        ProdutoImagem imagem = produtoImagemRepository.findById(imagemId)
                .orElseThrow(() -> new IllegalArgumentException("Imagem não encontrada."));

        if (!imagem.getProduto().getId().equals(produtoId)) {
            throw new AcessoNegadoException("Esta imagem não pertence a este produto.");
        }

        armazenamentoService.deletar(imagem.getUrlImagem());
        produtoImagemRepository.delete(imagem);

        Produto atualizado = produtoRepository.findById(produtoId).orElseThrow();
        return toResponse(atualizado);
    }

    // ======================== MÉTODOS PRIVADOS ========================

    private Produto buscarProdutoAtivo(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));

        if (!Boolean.TRUE.equals(produto.getAtivo())) {
            throw new ProdutoNaoEncontradoException(id);
        }
        return produto;
    }

    private Produto buscarProdutoComValidacao(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));

        Long artesaoLogadoId = securityUtils.getUsuarioLogadoId();
        if (!produto.getArtesao().getId().equals(artesaoLogadoId)) {
            throw new AcessoNegadoException("Você não pode modificar um produto que não é seu.");
        }

        return produto;
    }

    private ProdutoResponse toResponse(Produto p) {
        BigDecimal precoComDesconto = p.getPreco();
        if (Boolean.TRUE.equals(p.getEmPromocao()) && p.getPercentualDesconto() != null && p.getPercentualDesconto() > 0) {
            BigDecimal desconto = p.getPreco()
                    .multiply(BigDecimal.valueOf(p.getPercentualDesconto()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            precoComDesconto = p.getPreco().subtract(desconto);
        }

        return ProdutoResponse.builder()
                .id(p.getId())
                .nome(p.getNome())
                .descricao(p.getDescricao())
                .preco(p.getPreco())
                .precoComDesconto(precoComDesconto)
                .percentualDesconto(p.getPercentualDesconto())
                .emPromocao(p.getEmPromocao())
                .pecaUnica(p.getPecaUnica())
                .vendido(p.getVendido())
                .ativo(p.getAtivo())
                .material(p.getMaterial())
                .pesoGramas(p.getPesoGramas())
                .comprimentoCm(p.getComprimentoCm())
                .larguraCm(p.getLarguraCm())
                .alturaCm(p.getAlturaCm())
                .tempoProducaoDias(p.getTempoProducaoDias())
                .categoriaNome(p.getCategoria().getNome())
                .categoriaId(p.getCategoria().getId())
                .artesaoNomeAtelie(p.getArtesao().getNomeAtelie())
                .artesaoId(p.getArtesao().getId())
                .artesaoSeloVerificado(p.getArtesao().getSeloVerificado())
                .notaMedia(p.getNotaMedia())
                .totalAvaliacoes(p.getTotalAvaliacoes())
                .imagensUrls(p.getImagens() != null
                        ? p.getImagens().stream().map(ProdutoImagem::getUrlImagem).collect(Collectors.toList())
                        : Collections.emptyList())
                .criadoEm(p.getCriadoEm())
                .build();
    }
}
