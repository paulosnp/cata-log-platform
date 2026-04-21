package br.com.catalog.api.model;

import br.com.catalog.api.model.enums.RemetenteTipo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_chat_encomenda")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatEncomenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encomenda_id", nullable = false)
    private EncomendaPersonalizada encomenda;

    @Enumerated(EnumType.STRING)
    @Column(name = "remetente_tipo", nullable = false, length = 20)
    private RemetenteTipo remetenteTipo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @CreationTimestamp
    @Column(name = "data_envio", nullable = false, updatable = false)
    private LocalDateTime dataEnvio;

    @Column(name = "data_leitura")
    private LocalDateTime dataLeitura;
}
