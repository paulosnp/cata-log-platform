package br.com.catalog.api.controller;

import br.com.catalog.api.dto.ArtesaoVitrineResponse;
import br.com.catalog.api.service.ArtesaoVitrineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/artesaos")
@RequiredArgsConstructor
public class ArtesaoVitrineController {

    private final ArtesaoVitrineService artesaoVitrineService;

    @GetMapping("/vitrine")
    public ResponseEntity<Page<ArtesaoVitrineResponse>> buscarArtesaos(
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(artesaoVitrineService.buscarArtesaos(nome, pageable));
    }
}
