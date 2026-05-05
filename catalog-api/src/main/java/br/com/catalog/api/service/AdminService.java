package br.com.catalog.api.service;

import br.com.catalog.api.dto.admin.AdminResponse;
import br.com.catalog.api.dto.admin.ArtesaoAdminResponse;
import br.com.catalog.api.dto.admin.CompradorAdminResponse;
import br.com.catalog.api.dto.admin.DashboardResponse;
import br.com.catalog.api.dto.admin.FaturamentoResponse;
import br.com.catalog.api.dto.admin.TopArtesaoResponse;
import br.com.catalog.api.event.ArtesaoVerificadoEvent;
import br.com.catalog.api.model.Admin;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.model.enums.PermissaoAdmin;
import br.com.catalog.api.repository.AdminRepository;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import br.com.catalog.api.repository.PedidoRepository;
import br.com.catalog.api.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ArtesaoRepository artesaoRepository;
    private final CompradorRepository compradorRepository;
    private final ProdutoRepository produtoRepository;
    private final PedidoRepository pedidoRepository;
    private final AdminRepository adminRepository;
    private final ApplicationEventPublisher eventPublisher;

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

        eventPublisher.publishEvent(
                new ArtesaoVerificadoEvent(salvo.getEmail(), salvo.getNomeAtelie())
        );

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

    // ===================== GESTÃO DE COMPRADORES =====================

    @Transactional(readOnly = true)
    public Page<CompradorAdminResponse> listarTodosCompradores(Pageable pageable) {
        return compradorRepository.findAll(pageable)
                .map(this::toCompradorResponse);
    }

    @Transactional
    public CompradorAdminResponse bloquearComprador(Long id) {
        Comprador comprador = buscarComprador(id);
        comprador.setAtivo(false);
        Comprador salvo = compradorRepository.save(comprador);
        return toCompradorResponse(salvo);
    }

    @Transactional
    public CompradorAdminResponse desbloquearComprador(Long id) {
        Comprador comprador = buscarComprador(id);
        comprador.setAtivo(true);
        Comprador salvo = compradorRepository.save(comprador);
        return toCompradorResponse(salvo);
    }

    private Comprador buscarComprador(Long id) {
        return compradorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comprador não encontrado com ID: " + id));
    }

    private CompradorAdminResponse toCompradorResponse(Comprador c) {
        return CompradorAdminResponse.builder()
                .id(c.getId())
                .nome(c.getNome())
                .email(c.getEmail())
                .cpf(c.getCpf())
                .cidade(c.getCidade())
                .estado(c.getEstado())
                .ativo(c.getAtivo())
                .criadoEm(c.getCriadoEm())
                .build();
    }

    // ===================== RELATÓRIOS =====================

    @Transactional(readOnly = true)
    public FaturamentoResponse calcularFaturamento(LocalDateTime inicio, LocalDateTime fim) {
        BigDecimal totalFaturamento = pedidoRepository.somarFaturamentoPorPeriodo(inicio, fim);
        BigDecimal taxaPlataforma = pedidoRepository.somarTaxaPlataformaPorPeriodo(inicio, fim);
        Long totalPedidos = pedidoRepository.contarPedidosAprovadosPorPeriodo(inicio, fim);

        return FaturamentoResponse.builder()
                .totalFaturamento(totalFaturamento != null ? totalFaturamento : BigDecimal.ZERO)
                .taxaPlataforma(taxaPlataforma != null ? taxaPlataforma : BigDecimal.ZERO)
                .totalPedidos(totalPedidos != null ? totalPedidos : 0L)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TopArtesaoResponse> obterTopArtesaos(int limite) {
        List<Object[]> resultados = pedidoRepository.buscarTopArtesaosPorVendas(PageRequest.of(0, limite));

        return resultados.stream()
                .map(row -> TopArtesaoResponse.builder()
                        .artesaoId((Long) row[0])
                        .nomeArtesao((String) row[1])
                        .totalVendido((BigDecimal) row[2])
                        .quantidadePedidos((Long) row[3])
                        .build())
                .collect(Collectors.toList());
    }

    // ===================== GESTÃO DE ADMINS =====================

    @Transactional(readOnly = true)
    public List<AdminResponse> listarTodosAdmins() {
        return adminRepository.findAll().stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminResponse atualizarPermissoes(Long adminId, Set<PermissaoAdmin> novasPermissoes) {
        // RN-15.1: Admin não pode alterar suas próprias permissões
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin não encontrado com ID: " + adminId));

        if (admin.getEmail().equals(emailLogado)) {
            throw new IllegalArgumentException("Você não pode alterar suas próprias permissões.");
        }

        // RN-15.2: Garantir que pelo menos 1 admin mantenha GERENCIAR_ADMINS
        boolean alvoTinhaGerenciarAdmins = admin.getPermissoes().contains(PermissaoAdmin.GERENCIAR_ADMINS);
        boolean novasNaoTemGerenciarAdmins = !novasPermissoes.contains(PermissaoAdmin.GERENCIAR_ADMINS);

        if (alvoTinhaGerenciarAdmins && novasNaoTemGerenciarAdmins) {
            long totalComGerenciarAdmins = adminRepository.findAll().stream()
                    .filter(a -> a.getPermissoes().contains(PermissaoAdmin.GERENCIAR_ADMINS))
                    .count();

            if (totalComGerenciarAdmins <= 1) {
                throw new IllegalArgumentException(
                        "Operação negada. Este é o último admin com permissão GERENCIAR_ADMINS.");
            }
        }

        admin.getPermissoes().clear();
        admin.getPermissoes().addAll(novasPermissoes);
        Admin salvo = adminRepository.save(admin);
        return toAdminResponse(salvo);
    }

    private AdminResponse toAdminResponse(Admin a) {
        return AdminResponse.builder()
                .id(a.getId())
                .email(a.getEmail())
                .senhaTemporaria(a.getSenhaTemporaria())
                .permissoes(a.getPermissoes())
                .criadoEm(a.getCriadoEm())
                .build();
    }
}
