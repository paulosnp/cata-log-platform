package br.com.catalog.api.service;

import br.com.catalog.api.dto.admin.ArtesaoAdminResponse;
import br.com.catalog.api.dto.admin.DashboardResponse;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import br.com.catalog.api.repository.PedidoRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ArtesaoRepository artesaoRepository;
    private final CompradorRepository compradorRepository;
    private final ProdutoRepository produtoRepository;
    private final PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public DashboardResponse obterMetricasDashboard() {
        return DashboardResponse.builder()
                .totalArtesaos(artesaoRepository.count())
                .totalCompradores(compradorRepository.count())
                .totalProdutos(produtoRepository.count())
                .totalPedidos(pedidoRepository.count())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ArtesaoAdminResponse> listarTodosArtesaos(Pageable pageable) {
        return artesaoRepository.findAll(pageable)
                .map(this::toAdminResponse);
    }

    @Transactional
    public ArtesaoAdminResponse verificarArtesao(Long id) {
        Artesao artesao = buscarArtesao(id);
        artesao.setSeloVerificado(true);
        Artesao salvo = artesaoRepository.save(artesao);
        return toAdminResponse(salvo);
    }

    @Transactional
    public ArtesaoAdminResponse removerVerificacao(Long id) {
        Artesao artesao = buscarArtesao(id);
        artesao.setSeloVerificado(false);
        Artesao salvo = artesaoRepository.save(artesao);
        return toAdminResponse(salvo);
    }

    private Artesao buscarArtesao(Long id) {
        return artesaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artesão não encontrado com ID: " + id));
    }

    private ArtesaoAdminResponse toAdminResponse(Artesao a) {
        return ArtesaoAdminResponse.builder()
                .id(a.getId())
                .nomeAtelie(a.getNomeAtelie())
                .email(a.getEmail())
                .cep(a.getCep())
                .cidade(a.getCidade())
                .estado(a.getEstado())
                .seloVerificado(a.getSeloVerificado())
                .ativo(a.getAtivo())
                .criadoEm(a.getCriadoEm())
                .build();
    }
}
