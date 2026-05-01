package br.com.catalog.api.service;

import br.com.catalog.api.dto.CarrinhoResponse;
import br.com.catalog.api.dto.ItemCarrinhoRequest;
import br.com.catalog.api.dto.ItemCarrinhoResponse;
import br.com.catalog.api.exception.ProdutoIndisponivelException;
import br.com.catalog.api.exception.ProdutoNaoEncontradoException;
import br.com.catalog.api.model.Carrinho;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.model.ItemCarrinho;
import br.com.catalog.api.model.Produto;
import br.com.catalog.api.repository.CarrinhoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import br.com.catalog.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final CompradorRepository compradorRepository;
    private final ProdutoRepository produtoRepository;
    private final SecurityUtils securityUtils;

    public CarrinhoResponse verCarrinho() {
        Carrinho carrinho = buscarOuCriarCarrinho();
        return toResponse(carrinho);
    }

    @Transactional
    public CarrinhoResponse adicionarItem(ItemCarrinhoRequest request) {
        Carrinho carrinho = buscarOuCriarCarrinho();

        Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElseThrow(() -> new ProdutoNaoEncontradoException(request.getProdutoId()));

        validarDisponibilidade(produto);

        int quantidade = request.getQuantidade();
        if (Boolean.TRUE.equals(produto.getPecaUnica())) {
            quantidade = 1;
        }

        ItemCarrinho itemExistente = carrinho.getItens().stream()
                .filter(i -> i.getProduto().getId().equals(request.getProdutoId()))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            if (Boolean.TRUE.equals(produto.getPecaUnica())) {
                itemExistente.setQuantidade(1);
            } else {
                itemExistente.setQuantidade(quantidade);
            }
        } else {
            ItemCarrinho novoItem = ItemCarrinho.builder()
                    .carrinho(carrinho)
                    .produto(produto)
                    .quantidade(quantidade)
                    .build();
            carrinho.getItens().add(novoItem);
        }

        carrinhoRepository.save(carrinho);
        return toResponse(carrinho);
    }

    @Transactional
    public CarrinhoResponse removerItem(Long produtoId) {
        Carrinho carrinho = buscarOuCriarCarrinho();

        carrinho.getItens().removeIf(item ->
                item.getProduto().getId().equals(produtoId));

        carrinhoRepository.save(carrinho);
        return toResponse(carrinho);
    }

    @Transactional
    public void limparCarrinho() {
        Carrinho carrinho = buscarOuCriarCarrinho();
        carrinho.getItens().clear();
        carrinhoRepository.save(carrinho);
    }

    Carrinho buscarOuCriarCarrinho() {
        Long compradorId = securityUtils.getUsuarioLogadoId();
        return carrinhoRepository.findByCompradorId(compradorId)
                .orElseGet(() -> {
                    Comprador comprador = compradorRepository.findById(compradorId)
                            .orElseThrow(() -> new IllegalArgumentException("Comprador não encontrado."));
                    Carrinho novo = Carrinho.builder()
                            .comprador(comprador)
                            .build();
                    return carrinhoRepository.save(novo);
                });
    }

    private void validarDisponibilidade(Produto produto) {
        if (!Boolean.TRUE.equals(produto.getAtivo())) {
            throw new ProdutoIndisponivelException("Produto '" + produto.getNome() + "' não está mais disponível.");
        }
        if (!Boolean.TRUE.equals(produto.getCategoria().getAtivo())) {
            throw new ProdutoIndisponivelException("A categoria do produto '" + produto.getNome() + "' está inativa.");
        }
        if (!Boolean.TRUE.equals(produto.getArtesao().getAtivo())) {
            throw new ProdutoIndisponivelException("O artesão do produto '" + produto.getNome() + "' está inativo.");
        }
        if (Boolean.TRUE.equals(produto.getPecaUnica()) && Boolean.TRUE.equals(produto.getVendido())) {
            throw new ProdutoIndisponivelException("Produto '" + produto.getNome() + "' é peça única e já foi vendido.");
        }
    }

    private BigDecimal calcularPrecoComDesconto(Produto p) {
        BigDecimal preco = p.getPreco();
        if (Boolean.TRUE.equals(p.getEmPromocao()) && p.getPercentualDesconto() != null && p.getPercentualDesconto() > 0) {
            BigDecimal desconto = preco
                    .multiply(BigDecimal.valueOf(p.getPercentualDesconto()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            preco = preco.subtract(desconto);
        }
        return preco;
    }

    private CarrinhoResponse toResponse(Carrinho carrinho) {
        var itens = carrinho.getItens().stream().map(item -> {
            Produto p = item.getProduto();
            BigDecimal precoUnit = calcularPrecoComDesconto(p);
            BigDecimal subtotal = precoUnit.multiply(BigDecimal.valueOf(item.getQuantidade()));

            String imagemUrl = (p.getImagens() != null && !p.getImagens().isEmpty())
                    ? p.getImagens().get(0).getUrlImagem()
                    : null;

            return ItemCarrinhoResponse.builder()
                    .produtoId(p.getId())
                    .produtoNome(p.getNome())
                    .imagemUrl(imagemUrl)
                    .precoUnitario(precoUnit)
                    .quantidade(item.getQuantidade())
                    .subtotal(subtotal)
                    .pecaUnica(p.getPecaUnica())
                    .build();
        }).collect(Collectors.toList());

        BigDecimal valorTotal = itens.stream()
                .map(ItemCarrinhoResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CarrinhoResponse.builder()
                .id(carrinho.getId())
                .itens(itens)
                .valorTotal(valorTotal)
                .totalItens(itens.size())
                .build();
    }
}
