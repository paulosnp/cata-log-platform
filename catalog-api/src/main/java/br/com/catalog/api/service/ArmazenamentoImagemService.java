package br.com.catalog.api.service;

import br.com.catalog.api.exception.ArmazenamentoException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class ArmazenamentoImagemService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    @Value("${app.upload.dir}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new ArmazenamentoException("Não foi possível criar o diretório de uploads.", e);
        }
    }

    public String salvar(MultipartFile arquivo) {
        validarTipoArquivo(arquivo);

        String extensao = extrairExtensao(arquivo.getOriginalFilename());
        String nomeUnico = UUID.randomUUID() + extensao;
        Path destino = uploadPath.resolve(nomeUnico);

        try {
            arquivo.transferTo(destino.toFile());
        } catch (IOException e) {
            throw new ArmazenamentoException("Falha ao salvar imagem.", e);
        }

        return "/imagens/" + nomeUnico;
    }

    public void deletar(String urlImagem) {
        if (urlImagem == null || urlImagem.isBlank()) return;

        String nomeArquivo = urlImagem.replace("/imagens/", "");
        Path arquivo = uploadPath.resolve(nomeArquivo);

        try {
            Files.deleteIfExists(arquivo);
        } catch (IOException e) {
            throw new ArmazenamentoException("Falha ao excluir imagem.", e);
        }
    }

    private void validarTipoArquivo(MultipartFile arquivo) {
        String contentType = arquivo.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Tipo de arquivo não permitido. Aceitos: JPEG, PNG, WebP."
            );
        }
    }

    private String extrairExtensao(String nomeOriginal) {
        if (nomeOriginal == null || !nomeOriginal.contains(".")) {
            return ".jpg";
        }
        return nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
    }
}
