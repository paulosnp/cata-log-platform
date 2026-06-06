package br.com.catalog.api.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(remetente);
            helper.setTo(destinatario);
            helper.setSubject("🎉 Seu ateliê foi verificado pelo Cata Log!");

            String conteudoHtml = 
                    "<p style='margin-bottom: 20px;'>Olá <strong>" + nomeAtelie + "</strong>,</p>" +
                    "<p style='margin-bottom: 20px;'>Parabéns! O seu ateliê foi verificado pela curadoria do Cata Log " +
                    "e agora possui o <strong>Selo de Verificação</strong>.</p>" +
                    "<div style='background-color: #faf9f7; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0; border: 1px dashed #e5beb5;'>" +
                    "  <div style='font-size: 48px; margin-bottom: 12px;'>🎉</div>" +
                    "  <strong style='font-family: \"Manrope\", sans-serif; font-size: 20px; color: #b22300;'>Selo de Confiança Ativado</strong>" +
                    "</div>" +
                    "<p style='margin-bottom: 20px;'>Isto significa que os seus produtos agora exibem o selo de confiança, " +
                    "aumentando a visibilidade e a credibilidade da sua loja junto dos compradores.</p>" +
                    "<p style='margin-bottom: 0;'>Continue criando peças incríveis!</p>";

            String htmlCompleto = obterTemplateHtml("Ateliê Verificado", conteudoHtml);
            helper.setText(htmlCompleto, true);

            mailSender.send(mimeMessage);
            log.info("Email de verificação enviado para: {}", destinatario);
        } catch (Exception e) {
            log.error("Erro ao enviar email de verificação para {}: {}", destinatario, e.getMessage());
        }
    }

    public void enviarPinRecuperacao(String destinatario, String pin) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(remetente);
            helper.setTo(destinatario);
            helper.setSubject("🔐 Código de Recuperação de Senha — Cata Log");

            String conteudoHtml =
                    "<p style='margin-bottom: 20px;'>Olá,</p>" +
                    "<p style='margin-bottom: 20px;'>Recebemos uma solicitação para redefinir a sua senha no Cata Log.</p>" +
                    "<div style='background-color: #faf9f7; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0; border: 1px dashed #e5beb5;'>" +
                    "  <span style='font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #5c4039; display: block; margin-bottom: 8px;'>Seu código de recuperação</span>" +
                    "  <strong style='font-family: \"Manrope\", sans-serif; font-size: 36px; color: #FE4C24; letter-spacing: 4px;'>" + pin + "</strong>" +
                    "</div>" +
                    "<p style='font-size: 14px; color: #5c4039; margin-bottom: 0;'>Este código é válido por 15 minutos. Se você não solicitou esta redefinição, ignore este e-mail.</p>";

            String htmlCompleto = obterTemplateHtml("Recuperação de Senha", conteudoHtml);
            helper.setText(htmlCompleto, true);

            mailSender.send(mimeMessage);
            log.info("Email de recuperação de senha enviado para: {}", destinatario);
        } catch (Exception e) {
            log.error("Erro ao enviar email de recuperação para {}: {}", destinatario, e.getMessage());
        }
    }

    private String obterTemplateHtml(String titulo, String conteudoHtml) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head>" +
               "  <meta charset='utf-8'>" +
               "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
               "  <style>" +
               "    body {" +
               "      margin: 0;" +
               "      padding: 0;" +
               "      width: 100% !important;" +
               "      background-color: #faf9f7;" +
               "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" +
               "      color: #1a1c1b;" +
               "    }" +
               "    .wrapper {" +
               "      width: 100%;" +
               "      background-color: #faf9f7;" +
               "      padding: 40px 10px;" +
               "    }" +
               "    .container {" +
               "      max-width: 600px;" +
               "      margin: 0 auto;" +
               "      background-color: #ffffff;" +
               "      border-radius: 12px;" +
               "      box-shadow: 0 12px 32px rgba(26, 28, 27, 0.04);" +
               "      overflow: hidden;" +
               "    }" +
               "    .header {" +
               "      background: linear-gradient(135deg, #b22300 0%, #FE4C24 100%);" +
               "      padding: 32px;" +
               "      text-align: center;" +
               "    }" +
               "    .header img {" +
               "      height: 72px;" +
               "      max-height: 72px;" +
               "      border: none;" +
               "      outline: none;" +
               "      text-decoration: none;" +
               "    }" +
               "    .content {" +
               "      padding: 40px 32px;" +
               "    }" +
               "    .content h2 {" +
               "      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" +
               "      font-weight: 700;" +
               "      font-size: 22px;" +
               "      color: #1a1c1b;" +
               "      margin-top: 0;" +
               "      margin-bottom: 20px;" +
               "      line-height: 1.3;" +
               "    }" +
               "    .footer {" +
               "      padding: 32px;" +
               "      background-color: #f4f3f1;" +
               "      text-align: center;" +
               "      font-size: 14px;" +
               "      color: #5c4039;" +
               "    }" +
               "  </style>" +
               "</head>" +
               "<body>" +
               "  <div class='wrapper'>" +
               "    <div class='container'>" +
               "      <div class='header'>" +
               "        <a href='https://prismcode.site' target='_blank' style='text-decoration: none; border: none; outline: none;'>" +
               "          <img src='https://prismcode.site/logo-branco.png' alt='Cata Log' height='72' style='height: 72px; border: none; outline: none; text-decoration: none;' />" +
               "        </a>" +
               "      </div>" +
               "      <div class='content'>" +
               "        <h2 style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" + titulo + "</h2>" +
               "        " + conteudoHtml + "" +
               "      </div>" +
               "      <div class='footer'>" +
               "        <p style='margin: 0;'>Com carinho,<br><strong style='color: #1a1c1b;'>Equipe Cata Log</strong></p>" +
               "      </div>" +
               "    </div>" +
               "  </div>" +
               "</body>" +
               "</html>";
    }
}
