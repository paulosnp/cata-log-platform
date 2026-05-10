package br.com.catalog.api.service;

import br.com.catalog.api.dto.ItemPedidoResponse;
import br.com.catalog.api.dto.PedidoResponse;
import br.com.catalog.api.exception.CarrinhoVazioException;
import br.com.catalog.api.exception.ProdutoIndisponivelException;
import br.com.catalog.api.model.*;
import br.com.catalog.api.repository.PedidoRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import br.com.catalog.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private static final BigDecimal TAXA_PLATAFORMA_PERCENTUAL = new BigDecimal("10");

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final CarrinhoService carrinhoService;
    private final SecurityUtils securityUtils;

    @Transactional
    public PedidoResponse realizarCheckout() {
        Carrinho carrinho = carrinhoService.buscarOuCriarCarrinho();

        if (carrinho.getItens().isEmpty()) {
            throw new CarrinhoVazioException();
        }

        Comprador comprador = carrinho.getComprador();
        List<ItemPedido> itensPedido = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

        for (ItemCarrinho itemCarrinho : carrinho.getItens()) {
            Produto produto = itemCarrinho.getProduto();

            validarProdutoParaCompra(produto);

            BigDecimal precoCongelado = calcularPrecoComDesconto(produto);
            BigDecimal subtotal = precoCongelado.multiply(BigDecimal.valueOf(itemCarrinho.getQuantidade()));
            valorTotal = valorTotal.add(subtotal);

            ItemPedido itemPedido = ItemPedido.builder()
                    .produto(produto)
                    .quantidade(itemCarrinho.getQuantidade())
                    .precoUnitario(precoCongelado)
                    .build();
            itensPedido.add(itemPedido);

            // RN-05/RN-17: Peça única → marcar como vendida
            if (Boolean.TRUE.equals(produto.getPecaUnica())) {
                produto.setVendido(true);
                produtoRepository.save(produto);
            }
        }

        BigDecimal taxaPlataforma = valorTotal
                .multiply(TAXA_PLATAFORMA_PERCENTUAL)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal valorLiquidoArtesao = valorTotal.subtract(taxaPlataforma);

        Pedido pedido = Pedido.builder()
                .comprador(comprador)
                .valorTotal(valorTotal)
                .taxaPlataforma(taxaPlataforma)
                .valorLiquidoArtesao(valorLiquidoArtesao)
                .build();

        itensPedido.forEach(item -> item.setPedido(pedido));
        pedido.setItens(itensPedido);

        Pedido salvo = pedidoRepository.save(pedido);

        // Limpar carrinho após checkout
        carrinho.getItens().clear();

        return toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarMeusPedidos() {
        Long compradorId = securityUtils.getUsuarioLogadoId();
        return pedidoRepository.findByCompradorIdOrderByCriadoEmDesc(compradorId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void validarProdutoParaCompra(Produto produto) {
        if (!Boolean.TRUE.equals(produto.getAtivo())) {
            throw new ProdutoIndisponivelException("Produto '" + produto.getNome() + "' foi desativado.");
        }
        if (!Boolean.TRUE.equals(produto.getCategoria().getAtivo())) {
            throw new ProdutoIndisponivelException("Categoria do produto '" + produto.getNome() + "' está inativa.");
        }
        if (!Boolean.TRUE.equals(produto.getArtesao().getAtivo())) {
            throw new ProdutoIndisponivelException("Artesão do produto '" + produto.getNome() + "' está inativo.");
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

    private PedidoResponse toResponse(Pedido pedido) {
        var itens = pedido.getItens().stream().map(item -> {
            BigDecimal subtotal = item.getPrecoUnitario()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));

            return ItemPedidoResponse.builder()
                    .produtoId(item.getProduto().getId())
                    .produtoNome(item.getProduto().getNome())
                    .precoUnitario(item.getPrecoUnitario())
                    .quantidade(item.getQuantidade())
                    .subtotal(subtotal)
                    .build();
        }).collect(Collectors.toList());

        return PedidoResponse.builder()
                .id(pedido.getId())
                .statusPagamento(pedido.getStatusPagamento().name())
                .statusEntrega(pedido.getStatusEntrega().name())
                .valorTotal(pedido.getValorTotal())
                .taxaPlataforma(pedido.getTaxaPlataforma())
                .valorLiquidoArtesao(pedido.getValorLiquidoArtesao())
                .itens(itens)
                .criadoEm(pedido.getCriadoEm())
                .build();
    }
}
