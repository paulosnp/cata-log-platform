package br.com.catalog.api.service;

import br.com.catalog.api.dto.admin.LogAuditoriaResponse;
import br.com.catalog.api.model.Admin;
import br.com.catalog.api.model.LogAuditoria;
import br.com.catalog.api.repository.AdminRepository;
import br.com.catalog.api.repository.LogAuditoriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogAuditoriaService {

    private final LogAuditoriaRepository logAuditoriaRepository;
    private final AdminRepository adminRepository;

    // ===================== LEITURA =====================

    @Transactional(readOnly = true)
    public Page<LogAuditoriaResponse> listarLogs(
            Pageable pageable,
            String acao,
            Long adminId,
            LocalDateTime inicio,
            LocalDateTime fim) {

        return logAuditoriaRepository.buscarComFiltros(acao, adminId, inicio, fim, pageable)
                .map(this::toResponse);
    }

    // ===================== ESCRITA =====================

    /**
     * Registra uma ação de curadoria no log imutável.
     * Usa REQUIRES_NEW para garantir que o log seja persistido
     * mesmo que a transação principal falhe após o log.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(String acao, String entidadeAfetada, Long entidadeId, String detalhes) {
        Admin admin = resolverAdminLogado();

        LogAuditoria registro = LogAuditoria.builder()
                .admin(admin)
                .acao(acao)
                .entidadeAfetada(entidadeAfetada)
                .entidadeId(entidadeId)
                .detalhes(detalhes)
                .build();

        logAuditoriaRepository.save(registro);
        log.info("Audit log: {} | {} #{} | admin={}", acao, entidadeAfetada, entidadeId,
                admin != null ? admin.getEmail() : "sistema");
    }

    // ===================== HELPERS =====================

    private Admin resolverAdminLogado() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return adminRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private LogAuditoriaResponse toResponse(LogAuditoria l) {
        return LogAuditoriaResponse.builder()
                .id(l.getId())
                .adminEmail(l.getAdmin() != null ? l.getAdmin().getEmail() : "sistema")
                .acao(l.getAcao())
                .detalhes(l.getDetalhes())
                .entidadeAfetada(l.getEntidadeAfetada())
                .entidadeId(l.getEntidadeId())
                .dataHora(l.getDataHora())
                .build();
    }
}
