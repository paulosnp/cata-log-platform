package br.com.catalog.api.model.enums;

/**
 * Máquina de Estados da Encomenda Personalizada.
 *
 * Fluxo principal:
 * AGUARDANDO_ARTESAO → AGUARDANDO_COMPRADOR → PRECO_ACORDADO → EM_PRODUCAO → ENVIADO → ENTREGUE
 *
 * Fluxo de cancelamento:
 * (qualquer estado antes de PRECO_ACORDADO) → CANCELADO_ESTORNO_TOTAL
 * (após PRECO_ACORDADO) → CANCELADO_COM_TAXA
 */
public enum StatusEncomenda {

    AGUARDANDO_ARTESAO,

    AGUARDANDO_COMPRADOR,

    PRECO_ACORDADO,

    EM_PRODUCAO,

    ENVIADO,

    ENTREGUE,

    CANCELADO_ESTORNO_TOTAL,

    CANCELADO_COM_TAXA
}
