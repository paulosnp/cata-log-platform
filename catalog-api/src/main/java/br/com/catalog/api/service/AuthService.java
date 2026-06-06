package br.com.catalog.api.service;

import br.com.catalog.api.dto.*;
import br.com.catalog.api.event.RecuperacaoSenhaEvent;
import br.com.catalog.api.exception.CodigoRecuperacaoInvalidoException;
import br.com.catalog.api.exception.ContaBloqueadaException;
import br.com.catalog.api.exception.CredenciaisInvalidasException;
import br.com.catalog.api.exception.EmailNaoVerificadoException;
import br.com.catalog.api.model.Admin;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.repository.AdminRepository;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import br.com.catalog.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ArtesaoRepository artesaoRepository;
    private final CompradorRepository compradorRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;

    // ======================== LOGIN ========================

    public LoginResponse loginArtesao(LoginRequest request) {
        Artesao artesao = artesaoRepository.findByEmail(request.getEmail())
                .orElseThrow(CredenciaisInvalidasException::new);

        validarSenha(request.getSenha(), artesao.getSenha());

        // RN-07: Artesão bloqueado pelo Admin não pode acessar a plataforma
        if (Boolean.FALSE.equals(artesao.getAtivo())) {
            throw new ContaBloqueadaException();
        }

        if (Boolean.FALSE.equals(artesao.getEmailVerificado())) {
            throw new EmailNaoVerificadoException();
        }

        String token = jwtService.generateToken(
                artesao.getEmail(), "ARTESAO", artesao.getId()
        );

        return LoginResponse.builder()
                .id(artesao.getId())
                .token(token)
                .role("ARTESAO")
                .nome(artesao.getNomeAtelie())
                .senhaTemporaria(Boolean.TRUE.equals(artesao.getSenhaTemporaria()))
                .build();
    }

    public LoginResponse loginComprador(LoginRequest request) {
        Comprador comprador = compradorRepository.findByEmail(request.getEmail())
                .orElseThrow(CredenciaisInvalidasException::new);

        validarSenha(request.getSenha(), comprador.getSenha());

        // RN-07: Comprador bloqueado não pode acessar a plataforma
        if (Boolean.FALSE.equals(comprador.getAtivo())) {
            throw new ContaBloqueadaException();
        }

        if (Boolean.FALSE.equals(comprador.getEmailVerificado())) {
            throw new EmailNaoVerificadoException();
        }

        String token = jwtService.generateToken(
                comprador.getEmail(), "COMPRADOR", comprador.getId()
        );

        return LoginResponse.builder()
                .id(comprador.getId())
                .token(token)
                .role("COMPRADOR")
                .nome(comprador.getNome())
                .senhaTemporaria(false)
                .build();
    }

    public LoginResponse loginAdmin(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(CredenciaisInvalidasException::new);

        validarSenha(request.getSenha(), admin.getSenha());

        List<String> permissions = admin.getPermissoes().stream()
                .map(Enum::name)
                .toList();

        String token = jwtService.generateToken(
                admin.getEmail(), "ADMIN", admin.getId(), permissions
        );

        // RN-02: Flag para o frontend interceptar e forçar troca de senha no primeiro acesso
        return LoginResponse.builder()
                .id(admin.getId())
                .token(token)
                .role("ADMIN")
                .nome(admin.getEmail())
                .senhaTemporaria(Boolean.TRUE.equals(admin.getSenhaTemporaria()))
                .permissoes(permissions)
                .build();
    }

    // ======================== TROCA DE SENHA (RF-BK07) ========================

    public void trocarSenha(TrocarSenhaRequest request) {
        String email = getEmailUsuarioLogado();

        // Artesão e Admin são os únicos com senhaTemporaria
        Optional<Artesao> artesaoOpt = artesaoRepository.findByEmail(email);
        if (artesaoOpt.isPresent()) {
            Artesao artesao = artesaoOpt.get();
            validarSenha(request.getSenhaAtual(), artesao.getSenha());
            artesao.setSenha(passwordEncoder.encode(request.getNovaSenha()));
            artesao.setSenhaTemporaria(false);
            artesaoRepository.save(artesao);
            return;
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            validarSenha(request.getSenhaAtual(), admin.getSenha());
            admin.setSenha(passwordEncoder.encode(request.getNovaSenha()));
            admin.setSenhaTemporaria(false);
            adminRepository.save(admin);
            return;
        }

        Optional<Comprador> compradorOpt = compradorRepository.findByEmail(email);
        if (compradorOpt.isPresent()) {
            Comprador comprador = compradorOpt.get();
            validarSenha(request.getSenhaAtual(), comprador.getSenha());
            comprador.setSenha(passwordEncoder.encode(request.getNovaSenha()));
            compradorRepository.save(comprador);
            return;
        }

        throw new CredenciaisInvalidasException("Usuário não encontrado.");
    }

    // ======================== RECUPERAÇÃO DE SENHA (RF-BK06) ========================

    public void esqueciSenha(EsqueciSenhaRequest request) {
        String email = request.getEmail();
        String pin = String.valueOf(new Random().nextInt(100000, 999999));
        LocalDateTime validade = LocalDateTime.now().plusMinutes(15);

        Optional<Artesao> artesaoOpt = artesaoRepository.findByEmail(email);
        if (artesaoOpt.isPresent()) {
            Artesao artesao = artesaoOpt.get();
            artesao.setCodigoRecuperacao(pin);
            artesao.setValidadeCodigo(validade);
            artesaoRepository.save(artesao);
            eventPublisher.publishEvent(new RecuperacaoSenhaEvent(email, pin));
            return;
        }

        Optional<Comprador> compradorOpt = compradorRepository.findByEmail(email);
        if (compradorOpt.isPresent()) {
            Comprador comprador = compradorOpt.get();
            comprador.setCodigoVerificacao(pin);
            compradorRepository.save(comprador);
            eventPublisher.publishEvent(new RecuperacaoSenhaEvent(email, pin));
            return;
        }

        // Não revelar se o email existe ou não (segurança)
    }

    public void verificarPin(EsqueciSenhaRequest emailRequest, String pin) {
        String email = emailRequest.getEmail();

        Optional<Artesao> artesaoOpt = artesaoRepository.findByEmail(email);
        if (artesaoOpt.isPresent()) {
            Artesao artesao = artesaoOpt.get();
            validarCodigoRecuperacao(artesao.getCodigoRecuperacao(), artesao.getValidadeCodigo(), pin);
            return;
        }

        Optional<Comprador> compradorOpt = compradorRepository.findByEmail(email);
        if (compradorOpt.isPresent()) {
            Comprador comprador = compradorOpt.get();
            if (!pin.equals(comprador.getCodigoVerificacao())) {
                throw new CodigoRecuperacaoInvalidoException();
            }
            return;
        }

        throw new CodigoRecuperacaoInvalidoException();
    }

    public void redefinirSenha(RedefinirSenhaRequest request) {
        Optional<Artesao> artesaoOpt = artesaoRepository.findByEmail(request.getEmail());
        if (artesaoOpt.isPresent()) {
            Artesao artesao = artesaoOpt.get();
            validarCodigoRecuperacao(artesao.getCodigoRecuperacao(), artesao.getValidadeCodigo(), request.getPin());
            artesao.setSenha(passwordEncoder.encode(request.getNovaSenha()));
            artesao.setCodigoRecuperacao(null);
            artesao.setValidadeCodigo(null);
            artesaoRepository.save(artesao);
            return;
        }

        Optional<Comprador> compradorOpt = compradorRepository.findByEmail(request.getEmail());
        if (compradorOpt.isPresent()) {
            Comprador comprador = compradorOpt.get();
            if (!request.getPin().equals(comprador.getCodigoVerificacao())) {
                throw new CodigoRecuperacaoInvalidoException();
            }
            comprador.setSenha(passwordEncoder.encode(request.getNovaSenha()));
            comprador.setCodigoVerificacao(null);
            compradorRepository.save(comprador);
            return;
        }

        throw new CredenciaisInvalidasException("Usuário não encontrado.");
    }

    public void verificarCadastro(String email, String codigo) {
        Optional<Artesao> artesaoOpt = artesaoRepository.findByEmail(email);
        if (artesaoOpt.isPresent()) {
            Artesao artesao = artesaoOpt.get();
            if (codigo != null && codigo.equals(artesao.getCodigoVerificacao())) {
                artesao.setEmailVerificado(true);
                artesao.setCodigoVerificacao(null);
                artesaoRepository.save(artesao);
                return;
            }
            throw new CodigoRecuperacaoInvalidoException("Código de ativação inválido.");
        }

        Optional<Comprador> compradorOpt = compradorRepository.findByEmail(email);
        if (compradorOpt.isPresent()) {
            Comprador comprador = compradorOpt.get();
            if (codigo != null && codigo.equals(comprador.getCodigoVerificacao())) {
                comprador.setEmailVerificado(true);
                comprador.setCodigoVerificacao(null);
                compradorRepository.save(comprador);
                return;
            }
            throw new CodigoRecuperacaoInvalidoException("Código de ativação inválido.");
        }

        throw new CredenciaisInvalidasException("Usuário não encontrado.");
    }

    // ======================== MÉTODOS PRIVADOS ========================

    private void validarSenha(String senhaDigitada, String hashArmazenado) {
        if (!passwordEncoder.matches(senhaDigitada, hashArmazenado)) {
            throw new CredenciaisInvalidasException();
        }
    }

    private void validarCodigoRecuperacao(String codigoSalvo, LocalDateTime validade, String pinEnviado) {
        if (codigoSalvo == null || !codigoSalvo.equals(pinEnviado)) {
            throw new CodigoRecuperacaoInvalidoException();
        }
        if (validade != null && validade.isBefore(LocalDateTime.now())) {
            throw new CodigoRecuperacaoInvalidoException("Código de recuperação expirado. Solicite um novo.");
        }
    }

    private String getEmailUsuarioLogado() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public void reenviarVerificacao(String email) {
        String codigo = String.valueOf(new Random().nextInt(100000, 999999));

        Optional<Artesao> artesaoOpt = artesaoRepository.findByEmail(email);
        if (artesaoOpt.isPresent()) {
            Artesao artesao = artesaoOpt.get();
            if (Boolean.TRUE.equals(artesao.getEmailVerificado())) {
                throw new IllegalArgumentException("E-mail já verificado.");
            }
            artesao.setCodigoVerificacao(codigo);
            artesaoRepository.save(artesao);
            emailService.enviarCodigoVerificacaoCadastro(email, codigo);
            return;
        }

        Optional<Comprador> compradorOpt = compradorRepository.findByEmail(email);
        if (compradorOpt.isPresent()) {
            Comprador comprador = compradorOpt.get();
            if (Boolean.TRUE.equals(comprador.getEmailVerificado())) {
                throw new IllegalArgumentException("E-mail já verificado.");
            }
            comprador.setCodigoVerificacao(codigo);
            compradorRepository.save(comprador);
            emailService.enviarCodigoVerificacaoCadastro(email, codigo);
            return;
        }

        throw new IllegalArgumentException("Usuário não encontrado.");
    }

}
