package br.com.catalog.api.service;

import br.com.catalog.api.dto.FinanceiroArtesaoResponse;
import br.com.catalog.api.dto.FinanceiroArtesaoResponse.MovimentacaoResponse;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.EncomendaPersonalizada;
import br.com.catalog.api.model.Pedido;
import br.com.catalog.api.model.enums.StatusEncomenda;
import br.com.catalog.api.model.enums.StatusPagamento;
import br.com.catalog.api.repository.EncomendaRepository;
import br.com.catalog.api.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class FinanceiroArtesaoService {

    private final PedidoRepository pedidoRepository;
    private final EncomendaRepository encomendaRepository;
    private final ArtesaoPerfilService artesaoPerfilService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM");

    @Transactional(readOnly = true)
    public FinanceiroArtesaoResponse calcularFinanceiro() {
        Artesao artesao = artesaoPerfilService.getArtesaoLogado();
        Long artesaoId = artesao.getId();

        // Periodos
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).atStartOfDay();
        LocalDateTime fimMes = hoje.atTime(LocalTime.MAX);

        LocalDate mesAnterior = hoje.minusMonths(1);
        LocalDateTime inicioMesAnterior = mesAnterior.withDayOfMonth(1).atStartOfDay();
        LocalDateTime fimMesAnterior = mesAnterior.withDayOfMonth(mesAnterior.lengthOfMonth()).atTime(LocalTime.MAX);

        // Buscar pedidos aprovados de todos os tempos (para filtrar por artesao)
        List<Pedido> todosPedidos = pedidoRepository.findAll();

        // Filtrar vendas deste artesao
        List<Pedido> vendasMesAtual = new ArrayList<>();
        List<Pedido> vendasMesAnterior = new ArrayList<>();

        for (Pedido pedido : todosPedidos) {
            if (pedido.getStatusPagamento() != StatusPagamento.APROVADO) continue;

            boolean temProdutoDoArtesao = pedido.getItens().stream()
                    .anyMatch(item -> item.getProduto().getArtesao().getId().equals(artesaoId));

            if (!temProdutoDoArtesao) continue;

            if (!pedido.getCriadoEm().isBefore(inicioMes) && !pedido.getCriadoEm().isAfter(fimMes)) {
                vendasMesAtual.add(pedido);
            }
            if (!pedido.getCriadoEm().isBefore(inicioMesAnterior) && !pedido.getCriadoEm().isAfter(fimMesAnterior)) {
                vendasMesAnterior.add(pedido);
            }
        }

        // Encomendas concluidas (PRECO_ACORDADO) deste artesao
        List<EncomendaPersonalizada> todasEncomendas = encomendaRepository
                .findByArtesaoIdOrderByAtualizadoEmDesc(artesaoId, PageRequest.of(0, 100))
                .getContent();

        List<EncomendaPersonalizada> encomendasMesAtual = todasEncomendas.stream()
                .filter(e -> e.getStatus() == StatusEncomenda.PRECO_ACORDADO)
                .filter(e -> !e.getAtualizadoEm().isBefore(inicioMes) && !e.getAtualizadoEm().isAfter(fimMes))
                .toList();

        List<EncomendaPersonalizada> encomendasMesAnterior = todasEncomendas.stream()
                .filter(e -> e.getStatus() == StatusEncomenda.PRECO_ACORDADO)
                .filter(e -> !e.getAtualizadoEm().isBefore(inicioMesAnterior) && !e.getAtualizadoEm().isAfter(fimMesAnterior))
                .toList();

        // Calcular faturamento
        BigDecimal fatMesVendas = calcularFatVendas(vendasMesAtual, artesaoId);
        BigDecimal fatMesEncomendas = encomendasMesAtual.stream()
                .map(e -> e.getPrecoProposto() != null ? e.getPrecoProposto() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal faturamentoMes = fatMesVendas.add(fatMesEncomendas);

        BigDecimal fatMesAntVendas = calcularFatVendas(vendasMesAnterior, artesaoId);
        BigDecimal fatMesAntEncomendas = encomendasMesAnterior.stream()
                .map(e -> e.getPrecoProposto() != null ? e.getPrecoProposto() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal faturamentoMesAnterior = fatMesAntVendas.add(fatMesAntEncomendas);

        int totalVendasMes = vendasMesAtual.size() + encomendasMesAtual.size();

        // Montar movimentacoes (ultimas 20)
        List<MovimentacaoResponse> movimentacoes = new ArrayList<>();

        for (Pedido pedido : vendasMesAtual) {
            BigDecimal valorArtesao = calcularValorArtesaoNoPedido(pedido, artesaoId);
            String nomeProdutos = pedido.getItens().stream()
                    .filter(i -> i.getProduto().getArtesao().getId().equals(artesaoId))
                    .map(i -> i.getProduto().getNome())
                    .findFirst()
                    .orElse("Venda");

            movimentacoes.add(MovimentacaoResponse.builder()
                    .tipo("VENDA")
                    .descricao(nomeProdutos)
                    .detalhe("Venda direta")
                    .valor(valorArtesao)
                    .data(pedido.getCriadoEm().format(DATE_FMT))
                    .build());
        }

        for (EncomendaPersonalizada enc : encomendasMesAtual) {
            movimentacoes.add(MovimentacaoResponse.builder()
                    .tipo("ENCOMENDA")
                    .descricao(enc.getProdutoReferencia() != null
                            ? enc.getProdutoReferencia().getNome()
                            : "Encomenda personalizada")
                    .detalhe("Encomenda — " + (enc.getComprador() != null
                            ? enc.getComprador().getNome()
                            : "Cliente"))
                    .valor(enc.getPrecoProposto() != null ? enc.getPrecoProposto() : BigDecimal.ZERO)
                    .data(enc.getAtualizadoEm().format(DATE_FMT))
                    .build());
        }

        // Ordenar por data desc e limitar
        movimentacoes.sort((a, b) -> b.getData().compareTo(a.getData()));
        if (movimentacoes.size() > 20) {
            movimentacoes = movimentacoes.subList(0, 20);
        }

        List<StatusEncomenda> escrowStatuses = Arrays.asList(
                StatusEncomenda.PRECO_ACORDADO,
                StatusEncomenda.EM_PRODUCAO,
                StatusEncomenda.ENVIADO);
        BigDecimal saldoEmEspera = encomendaRepository
                .sumValorRetidoByArtesaoIdAndStatusIn(artesaoId, escrowStatuses);

        return FinanceiroArtesaoResponse.builder()
                .faturamentoMes(faturamentoMes)
                .faturamentoMesAnterior(faturamentoMesAnterior)
                .totalVendasMes(totalVendasMes)
                .saldoDisponivel(artesao.getSaldoRendimentos() != null
                        ? artesao.getSaldoRendimentos() : BigDecimal.ZERO)
                .saldoEmEspera(saldoEmEspera)
                .movimentacoes(movimentacoes)
                .build();
    }

    private BigDecimal calcularFatVendas(List<Pedido> pedidos, Long artesaoId) {
        BigDecimal total = BigDecimal.ZERO;
        for (Pedido pedido : pedidos) {
            total = total.add(calcularValorArtesaoNoPedido(pedido, artesaoId));
        }
        return total;
    }

    private BigDecimal calcularValorArtesaoNoPedido(Pedido pedido, Long artesaoId) {
        return pedido.getItens().stream()
                .filter(i -> i.getProduto().getArtesao().getId().equals(artesaoId))
                .map(i -> i.getPrecoUnitario().multiply(BigDecimal.valueOf(i.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
