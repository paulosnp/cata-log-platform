package br.com.catalog.api.listener;

import br.com.catalog.api.event.ArtesaoVerificadoEvent;
import br.com.catalog.api.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificacaoListener {

    private final EmailService emailService;

    @Async
    @EventListener
    public void onArtesaoVerificado(ArtesaoVerificadoEvent evento) {
        log.info("Evento recebido: Artesão '{}' verificado. Enviando email para: {}",
                evento.getNomeAtelie(), evento.getEmail());

        emailService.enviarEmailVerificacao(evento.getEmail(), evento.getNomeAtelie());
    }
}
