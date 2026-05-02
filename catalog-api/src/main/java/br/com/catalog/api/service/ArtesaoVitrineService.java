package br.com.catalog.api.service;

import br.com.catalog.api.dto.ArtesaoVitrineResponse;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.repository.ArtesaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArtesaoVitrineService {

    private final ArtesaoRepository artesaoRepository;

    public Page<ArtesaoVitrineResponse> buscarArtesaos(String nome, Pageable pageable) {
        Page<Artesao> artesaos;

        if (nome != null && !nome.isBlank()) {
            artesaos = artesaoRepository.findByNomeAtelieContainingIgnoreCaseAndAtivoTrue(nome, pageable);
        } else {
            artesaos = artesaoRepository.findByAtivoTrue(pageable);
        }

        return artesaos.map(this::toResponse);
    }

    private ArtesaoVitrineResponse toResponse(Artesao a) {
        return ArtesaoVitrineResponse.builder()
                .id(a.getId())
                .nomeAtelie(a.getNomeAtelie())
                .biografia(a.getBiografia())
                .cidade(a.getCidade())
                .estado(a.getEstado())
                .seloVerificado(a.getSeloVerificado())
                .build();
    }
}
