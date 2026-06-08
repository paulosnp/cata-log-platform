package br.com.catalog.api.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogAuditoriaResponse {
    private Long id;
    private String adminEmail;
    private String acao;
    private String detalhes;
    private String entidadeAfetada;
    private Long entidadeId;
    private LocalDateTime dataHora;
}
