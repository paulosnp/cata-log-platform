package br.com.catalog.api.service;

import br.com.catalog.api.dto.AdminRegistroRequest;
import br.com.catalog.api.dto.ArtesaoRegistroRequest;
import br.com.catalog.api.dto.CompradorRegistroRequest;
import br.com.catalog.api.exception.EmailJaCadastradoException;
import br.com.catalog.api.model.Admin;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.model.enums.PermissaoAdmin;
import br.com.catalog.api.repository.AdminRepository;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistroService {

    private final ArtesaoRepository artesaoRepository;
    private final CompradorRepository compradorRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public void registrarArtesao(ArtesaoRegistroRequest request) {
        validarEmailUnico(request.getEmail());

        String codigo = String.valueOf(new Random().nextInt(100000, 999999));

        Artesao artesao = Artesao.builder()
                .nomeAtelie(request.getNomeAtelie())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .cep(request.getCep())
                .telefoneWhatsapp(request.getTelefoneWhatsapp())
                .emailVerificado(false)
                .codigoVerificacao(codigo)
                .build();

        artesaoRepository.save(artesao);
        emailService.enviarCodigoVerificacaoCadastro(artesao.getEmail(), codigo);
    }

    public void registrarComprador(CompradorRegistroRequest request) {
        validarEmailUnico(request.getEmail());

        String codigo = String.valueOf(new Random().nextInt(100000, 999999));

        Comprador comprador = Comprador.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .emailVerificado(false)
                .codigoVerificacao(codigo)
                .build();

        compradorRepository.save(comprador);
        emailService.enviarCodigoVerificacaoCadastro(comprador.getEmail(), codigo);
    }

    // RN-02: Apenas um Admin logado pode criar outro Admin
    public Map<String, String> registrarAdmin(AdminRegistroRequest request) {
        validarEmailUnico(request.getEmail());

        String senhaTemporariaStr = UUID.randomUUID().toString().substring(0, 8);

        Admin admin = Admin.builder()
                .email(request.getEmail())
                .senha(passwordEncoder.encode(senhaTemporariaStr))
                .permissoes(EnumSet.of(PermissaoAdmin.VER_DASHBOARD))
                .build();

        adminRepository.save(admin);

        return Map.of(
                "mensagem", "Administrador criado com sucesso.",
                "senhaTemporaria", senhaTemporariaStr
        );
    }

    private void validarEmailUnico(String email) {
        boolean existe = artesaoRepository.findByEmail(email).isPresent()
                || compradorRepository.findByEmail(email).isPresent()
                || adminRepository.findByEmail(email).isPresent();

        if (existe) {
            throw new EmailJaCadastradoException();
        }
    }
}
