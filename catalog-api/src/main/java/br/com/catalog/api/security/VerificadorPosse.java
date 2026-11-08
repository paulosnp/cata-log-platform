package br.com.catalog.api.security;

import br.com.catalog.api.exception.PedidoMultiArtesaoException;
import br.com.catalog.api.exception.RecursoNaoEncontradoException;
import br.com.catalog.api.model.EncomendaPersonalizada;
import br.com.catalog.api.model.Pedido;
import br.com.catalog.api.repository.EncomendaRepository;
import br.com.catalog.api.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Ponto único de checagem de posse (busca por ID + dono).
 *
 * - Inexistente e "de outro usuário" geram a mesma RecursoNaoEncontradoException (404),
 *   para não revelar se o ID existe.
 * - O userId do JWT só é comparado com o dono do MESMO papel: IDs de artesão, comprador
 *   e admin vêm de tabelas diferentes e colidem (artesão 5 != comprador 5).
 */
@Component
@RequiredArgsConstructor
public class VerificadorPosse {

    private static final String ADMIN = "ADMIN";
    private static final String ARTESAO = "ARTESAO";
    private static final String COMPRADOR = "COMPRADOR";

    private final SecurityUtils securityUtils;
    private final EncomendaRepository encomendaRepository;
    private final PedidoRepository pedidoRepository;

    /**
     * Encomenda acessível ao usuário logado: o comprador dela, o artesão dela ou ADMIN.
     * O ADMIN só chega aqui nos endpoints cujo @PreAuthorize o permite.
     */
    @Transactional(readOnly = true)
    public EncomendaPersonalizada encomenda(Long id) {
        String papel = securityUtils.getPapelUsuarioLogado();
        Long userId = securityUtils.getUsuarioLogadoId();
        return encomendaRepository.findById(id)
                .filter(e -> switch (papel) {
                    case ADMIN -> true;
                    case COMPRADOR -> e.getComprador().getId().equals(userId);
                    case ARTESAO -> e.getArtesao().getId().equals(userId);
                    default -> false;
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Encomenda não encontrada."));
    }

    /** Pedido do comprador logado. */
    @Transactional(readOnly = true)
    public Pedido pedidoDoComprador(Long id) {
        String papel = securityUtils.getPapelUsuarioLogado();
        Long userId = securityUtils.getUsuarioLogadoId();
        return pedidoRepository.findById(id)
                .filter(p -> COMPRADOR.equals(papel) && p.getComprador().getId().equals(userId))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado."));
    }

    /**
     * Pedido em que o artesão logado pode gerar envio.
     *
     * Regra multi-artesão: o Pedido tem UM codigoRastreioMe e UM statusEntrega, então o
     * envio só é permitido quando TODOS os itens são do artesão logado.
     *  - pedido inexistente ou sem nenhum item dele → 404
     *  - itens dele + de outro(s) artesão(s)        → 409 (PedidoMultiArtesaoException):
     *    gerar a etiqueta só da parte dele marcaria o pedido inteiro como ENVIADO com um
     *    rastreio que não cobre os itens dos outros.
     */
    @Transactional(readOnly = true)
    public Pedido pedidoDoArtesao(Long id) {
        String papel = securityUtils.getPapelUsuarioLogado();
        Long userId = securityUtils.getUsuarioLogadoId();
        Pedido pedido = pedidoRepository.findById(id)
                .filter(p -> ARTESAO.equals(papel))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado."));

        Set<Long> artesaos = pedido.getItens().stream()
                .map(item -> item.getProduto().getArtesao().getId())
                .collect(Collectors.toSet());

        if (!artesaos.contains(userId)) {
            throw new RecursoNaoEncontradoException("Pedido não encontrado.");
        }
        if (artesaos.size() > 1) {
            throw new PedidoMultiArtesaoException();
        }
        return pedido;
    }
}
