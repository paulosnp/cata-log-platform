package br.com.catalog.api.model.enums;

/**
 * Máquina de Estados da Encomenda Personalizada.
 *
 * Fluxo principal:
 * AGUARDANDO_ARTESAO → AGUARDANDO_COMPRADOR → PRECO_ACORDADO
 *
 * Fluxo de cancelamento:
 * (qualquer estado antes de PRECO_ACORDADO) → CANCELADO_ESTORNO_TOTAL
 * (após PRECO_ACORDADO) → CANCELADO_COM_TAXA
 */
public enum StatusEncomenda {

    /** Encomenda criada pelo comprador, aguardando contraproposta do artesão. */
    AGUARDANDO_ARTESAO,

    /** Artesão respondeu com preço/prazo, aguardando aceite do comprador. */
    AGUARDANDO_COMPRADOR,

    /** Preço acordado entre ambas as partes. Valor retido em Escrow (30%). */
    PRECO_ACORDADO,

    /** Cancelamento antes do acordo — estorno total ao comprador, sem taxa. */
    CANCELADO_ESTORNO_TOTAL,

    /** Cancelamento após acordo — taxa de cancelamento (Fee) aplicada. */
    CANCELADO_COM_TAXA
}
