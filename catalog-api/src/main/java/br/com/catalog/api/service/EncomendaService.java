package br.com.catalog.api.service;

import br.com.catalog.api.dto.encomenda.ContrapropostaRequest;
import br.com.catalog.api.dto.encomenda.EncomendaResponse;
import br.com.catalog.api.dto.encomenda.NovaEncomendaRequest;
import br.com.catalog.api.exception.EstadoEncomendaInvalidoException;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.model.EncomendaPersonalizada;
import br.com.catalog.api.model.Produto;
import br.com.catalog.api.model.enums.StatusEncomenda;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import br.com.catalog.api.repository.EncomendaRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import br.com.catalog.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EncomendaService {

    private final EncomendaRepository encomendaRepository;
    private final CompradorRepository compradorRepository;
    private final ArtesaoRepository artesaoRepository;
    private final ProdutoRepository produtoRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public EncomendaResponse criarEncomenda(NovaEncomendaRequest request) {
        Long compradorId = securityUtils.getUsuarioLogadoId();

        Comprador comprador = compradorRepository.findById(compradorId)
                .orElseThrow(() -> new IllegalArgumentException("Comprador não encontrado."));

        Artesao artesao = artesaoRepository.findById(request.getArtesaoId())
                .orElseThrow(() -> new IllegalArgumentException("Artesão não encontrado."));

        Produto produtoReferencia = null;
        if (request.getProdutoReferenciaId() != null) {
            produtoReferencia = produtoRepository.findById(request.getProdutoReferenciaId())
                    .orElseThrow(() -> new IllegalArgumentException("Produto de referência não encontrado."));
        }

        EncomendaPersonalizada encomenda = EncomendaPersonalizada.builder()
                .comprador(comprador)
                .artesao(artesao)
                .produtoReferencia(produtoReferencia)
                .observacoesCliente(request.getObservacoesCliente())
                .status(StatusEncomenda.AGUARDANDO_ARTESAO)
                .streamChannelId(UUID.randomUUID().toString())
                .build();

        EncomendaPersonalizada salva = encomendaRepository.save(encomenda);
        return toResponse(salva);
    }

    @Transactional
    public EncomendaResponse enviarContraproposta(Long encomendaId, ContrapropostaRequest request) {
        Long artesaoId = securityUtils.getUsuarioLogadoId();

        EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);
        validarOwnershipArtesao(encomenda, artesaoId);
        validarTransicao(encomenda, StatusEncomenda.AGUARDANDO_ARTESAO, "AGUARDANDO_COMPRADOR");

        encomenda.setPrecoProposto(request.getPrecoProposto());
        encomenda.setTempoProducaoDias(request.getTempoProducaoDias());
        encomenda.setStatus(StatusEncomenda.AGUARDANDO_COMPRADOR);

        EncomendaPersonalizada atualizada = encomendaRepository.save(encomenda);
        return toResponse(atualizada);
    }

    @Transactional
    public EncomendaResponse aceitarEncomenda(Long encomendaId) {
        Long compradorId = securityUtils.getUsuarioLogadoId();

        EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);
        validarOwnershipComprador(encomenda, compradorId);
        validarTransicao(encomenda, StatusEncomenda.AGUARDANDO_COMPRADOR, "PRECO_ACORDADO");

        encomenda.setStatus(StatusEncomenda.PRECO_ACORDADO);
        encomenda.setDataAceite(LocalDateTime.now());
        encomenda.setValorRetido(encomenda.getPrecoProposto());

        EncomendaPersonalizada atualizada = encomendaRepository.save(encomenda);
        return toResponse(atualizada);
    }

    @Transactional
    public EncomendaResponse iniciarProducao(Long encomendaId) {
        Long artesaoId = securityUtils.getUsuarioLogadoId();

        EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);
        validarOwnershipArtesao(encomenda, artesaoId);
        validarTransicao(encomenda, StatusEncomenda.PRECO_ACORDADO, "EM_PRODUCAO");

        encomenda.setStatus(StatusEncomenda.EM_PRODUCAO);
        return toResponse(encomendaRepository.save(encomenda));
    }

    @Transactional
    public EncomendaResponse marcarEnviado(Long encomendaId) {
        Long artesaoId = securityUtils.getUsuarioLogadoId();

        EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);
        validarOwnershipArtesao(encomenda, artesaoId);
        validarTransicao(encomenda, StatusEncomenda.EM_PRODUCAO, "ENVIADO");

        encomenda.setStatus(StatusEncomenda.ENVIADO);
        return toResponse(encomendaRepository.save(encomenda));
    }

    @Transactional
    public EncomendaResponse confirmarEntrega(Long encomendaId) {
        EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);
        validarTransicao(encomenda, StatusEncomenda.ENVIADO, "ENTREGUE");

        encomenda.setStatus(StatusEncomenda.ENTREGUE);

        BigDecimal valorRetido = encomenda.getValorRetido();
        if (valorRetido != null && valorRetido.compareTo(BigDecimal.ZERO) > 0) {
            Artesao artesao = encomenda.getArtesao();
            BigDecimal saldoAtual = artesao.getSaldoRendimentos() != null
                    ? artesao.getSaldoRendimentos() : BigDecimal.ZERO;
            artesao.setSaldoRendimentos(saldoAtual.add(valorRetido));
            artesaoRepository.save(artesao);
            encomenda.setValorRetido(BigDecimal.ZERO);
        }

        return toResponse(encomendaRepository.save(encomenda));
    }

    // ======================== LEITURA ========================

    @Transactional(readOnly = true)
    public Page<EncomendaResponse> listarMinhasEncomendasComprador(Pageable pageable) {
        Long compradorId = securityUtils.getUsuarioLogadoId();
        return encomendaRepository.findByCompradorIdOrderByAtualizadoEmDesc(compradorId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public EncomendaResponse buscarPorId(Long id) {
        EncomendaPersonalizada encomenda = buscarEncomenda(id);
        return toResponse(encomenda);
    }

    @Transactional(readOnly = true)
    public Page<EncomendaResponse> listarMinhasEncomendasArtesao(Pageable pageable) {
        Long artesaoId = securityUtils.getUsuarioLogadoId();
        return encomendaRepository.findByArtesaoIdOrderByAtualizadoEmDesc(artesaoId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EncomendaResponse> listarTodasEncomendas(Pageable pageable) {
        return encomendaRepository.findAllByOrderByAtualizadoEmDesc(pageable)
                .map(this::toResponse);
    }

    // ======================== PRIVADOS ========================

    private EncomendaPersonalizada buscarEncomenda(Long id) {
        return encomendaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encomenda não encontrada."));
    }

    private void validarOwnershipArtesao(EncomendaPersonalizada encomenda, Long artesaoId) {
        if (!encomenda.getArtesao().getId().equals(artesaoId)) {
            throw new SecurityException("Você não tem permissão para alterar esta encomenda.");
        }
    }

    private void validarOwnershipComprador(EncomendaPersonalizada encomenda, Long compradorId) {
        if (!encomenda.getComprador().getId().equals(compradorId)) {
            throw new SecurityException("Você não tem permissão para aceitar esta encomenda.");
        }
    }

    private void validarTransicao(EncomendaPersonalizada encomenda, StatusEncomenda esperado, String destino) {
        if (encomenda.getStatus() != esperado) {
            throw new EstadoEncomendaInvalidoException(
                    "Transição para " + destino + " requer status " + esperado + ". Atual: " + encomenda.getStatus());
        }
    }

    private EncomendaResponse toResponse(EncomendaPersonalizada e) {
        return EncomendaResponse.builder()
                .id(e.getId())
                .status(e.getStatus().name())
                .observacoesCliente(e.getObservacoesCliente())
                .precoProposto(e.getPrecoProposto())
                .tempoProducaoDias(e.getTempoProducaoDias())
                .streamChannelId(e.getStreamChannelId())
                .compradorId(e.getComprador().getId())
                .nomeComprador(e.getComprador().getNome())
                .artesaoId(e.getArtesao().getId())
                .nomeArtesao(e.getArtesao().getNomeAtelie())
                .produtoReferenciaId(e.getProdutoReferencia() != null ? e.getProdutoReferencia().getId() : null)
                .nomeProdutoReferencia(e.getProdutoReferencia() != null ? e.getProdutoReferencia().getNome() : null)
                .criadoEm(e.getCriadoEm())
                .atualizadoEm(e.getAtualizadoEm())
                .build();
    }
}
