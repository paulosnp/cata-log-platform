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

        // Validação de ownership: apenas o artesão dono pode responder
        if (!encomenda.getArtesao().getId().equals(artesaoId)) {
            throw new SecurityException("Você não tem permissão para responder esta encomenda.");
        }

        // Validação de estado: só aceita contraproposta se estiver aguardando artesão
        if (encomenda.getStatus() != StatusEncomenda.AGUARDANDO_ARTESAO) {
            throw new EstadoEncomendaInvalidoException(
                    "Contraproposta só pode ser enviada quando o status for AGUARDANDO_ARTESAO. Status atual: " + encomenda.getStatus());
        }

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

        // Validação de ownership: apenas o comprador dono pode aceitar
        if (!encomenda.getComprador().getId().equals(compradorId)) {
            throw new SecurityException("Você não tem permissão para aceitar esta encomenda.");
        }

        // Validação de estado: só aceita se estiver aguardando comprador
        if (encomenda.getStatus() != StatusEncomenda.AGUARDANDO_COMPRADOR) {
            throw new EstadoEncomendaInvalidoException(
                    "Encomenda só pode ser aceita quando o status for AGUARDANDO_COMPRADOR. Status atual: " + encomenda.getStatus());
        }

        encomenda.setStatus(StatusEncomenda.PRECO_ACORDADO);

        EncomendaPersonalizada atualizada = encomendaRepository.save(encomenda);
        return toResponse(atualizada);
    }

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

    private EncomendaPersonalizada buscarEncomenda(Long id) {
        return encomendaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Encomenda não encontrada."));
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
