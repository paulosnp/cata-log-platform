package br.com.catalog.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:nao-responda@catalog.com}")
    private String remetente;

    public void enviarEmailVerificacao(String destinatario, String nomeAtelie) {
        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setFrom(remetente);
            mensagem.setTo(destinatario);
            mensagem.setSubject("🎉 Seu ateliê foi verificado pelo Cata Log!");
            mensagem.setText(
                    "Olá " + nomeAtelie + ",\n\n" +
                    "Parabéns! O seu ateliê foi verificado pela curadoria do Cata Log " +
                    "e agora possui o Selo de Verificação.\n\n" +
                    "Isto significa que os seus produtos agora exibem o selo de confiança, " +
                    "aumentando a visibilidade e a credibilidade da sua loja junto dos compradores.\n\n" +
                    "Continue criando peças incríveis!\n\n" +
                    "Com carinho,\n" +
                    "Equipa Cata Log"
            );

            mailSender.send(mensagem);
            log.info("Email de verificação enviado para: {}", destinatario);
        } catch (Exception e) {
            log.error("Erro ao enviar email de verificação para {}: {}", destinatario, e.getMessage());
        }
    }
}
