package br.com.catalog.api.service;

import br.com.catalog.api.dto.ArtesaoPerfilResponse;
import br.com.catalog.api.dto.AtualizarPerfilRequest;
import br.com.catalog.api.exception.AcessoNegadoException;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ArtesaoPerfilService {

    private final ArtesaoRepository artesaoRepository;
    private final SecurityUtils securityUtils;
    private final ArmazenamentoImagemService armazenamentoService;

    @Transactional(readOnly = true)
    public ArtesaoPerfilResponse getMeuPerfil() {
        Artesao artesao = getArtesaoLogado();
        return toResponse(artesao);
    }

    @Transactional
    public ArtesaoPerfilResponse atualizarPerfil(AtualizarPerfilRequest request) {
        Artesao artesao = getArtesaoLogado();

        if (request.getNomeAtelie() != null && !request.getNomeAtelie().isBlank()) {
            artesao.setNomeAtelie(request.getNomeAtelie().trim());
        }
        if (request.getBiografia() != null) {
            artesao.setBiografia(request.getBiografia().trim());
        }
        if (request.getTelefoneWhatsapp() != null) {
            artesao.setTelefoneWhatsapp(request.getTelefoneWhatsapp().trim());
        }
        if (request.getCep() != null && !request.getCep().isBlank()) {
            artesao.setCep(request.getCep().trim());
        }

        Artesao salvo = artesaoRepository.save(artesao);
        return toResponse(salvo);
    }

    @Transactional
    public ArtesaoPerfilResponse uploadFoto(MultipartFile arquivo) {
        Artesao artesao = getArtesaoLogado();

        // Deletar foto anterior se existir
        if (artesao.getFotoUrl() != null && !artesao.getFotoUrl().isBlank()) {
            armazenamentoService.deletar(artesao.getFotoUrl());
        }

        String url = armazenamentoService.salvar(arquivo);
        artesao.setFotoUrl(url);
        Artesao salvo = artesaoRepository.save(artesao);
        return toResponse(salvo);
    }

    Artesao getArtesaoLogado() {
        Long artesaoId = securityUtils.getUsuarioLogadoId();
        return artesaoRepository.findById(artesaoId)
                .orElseThrow(() -> new AcessoNegadoException("Artesão não encontrado."));
    }

    ArtesaoPerfilResponse toResponse(Artesao artesao) {
        return ArtesaoPerfilResponse.builder()
                .id(artesao.getId())
                .email(artesao.getEmail())
                .nomeAtelie(artesao.getNomeAtelie())
                .biografia(artesao.getBiografia())
                .telefoneWhatsapp(artesao.getTelefoneWhatsapp())
                .cep(artesao.getCep())
                .estado(artesao.getEstado())
                .cidade(artesao.getCidade())
                .seloVerificado(artesao.getSeloVerificado())
                .emailVerificado(artesao.getEmailVerificado())
                .fotoUrl(artesao.getFotoUrl())
                .criadoEm(artesao.getCriadoEm() != null ? artesao.getCriadoEm().toString() : null)
                .build();
    }
}
