package br.com.catalog.api.model.enums;

/**
 * Status de entrega de um pedido (SLA logístico).
 */
public enum StatusEntrega {

    AGUARDANDO_ENVIO,
    ENVIADO,
    EM_TRANSITO,
    ENTREGUE,
    DEVOLVIDO
}
