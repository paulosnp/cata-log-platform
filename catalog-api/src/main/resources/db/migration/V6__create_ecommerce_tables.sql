-- =====================================================
-- V6: Tabelas de Pedido e Itens
-- Requisito: RF-DB10
-- Regras de Negócio: RN11, RN12
-- =====================================================

-- -------------------------------------------------------
-- TB_PEDIDO (RF-DB10)
-- Registra transações financeiras com controle de taxas,
-- status de pagamento (RN11) e SLA logístico (RN12).
-- -------------------------------------------------------
CREATE TABLE tb_pedido (
    id                          BIGSERIAL       PRIMARY KEY,
    comprador_id                BIGINT          NOT NULL REFERENCES tb_comprador(id),

    -- Status (RN11: pagamento default PENDENTE, RN12: entrega default AGUARDANDO_ENVIO)
    status_pagamento            VARCHAR(50)     DEFAULT 'PENDENTE',
    status_entrega              VARCHAR(50)     DEFAULT 'AGUARDANDO_ENVIO',

    -- Integração com Mercado Pago
    id_transacao_mp             VARCHAR(100),
    codigo_rastreio_me          VARCHAR(100),

    -- Valores Financeiros
    valor_total                 DECIMAL(10,2)   NOT NULL,
    taxa_plataforma             DECIMAL(10,2)   NOT NULL,
    valor_liquido_artesao       DECIMAL(10,2)   NOT NULL,

    -- Datas
    data_entrega_realizada      TIMESTAMP,
    criado_em                   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em               TIMESTAMP
);

CREATE INDEX idx_pedido_comprador           ON tb_pedido(comprador_id);
CREATE INDEX idx_pedido_status_pagamento    ON tb_pedido(status_pagamento);
CREATE INDEX idx_pedido_status_entrega      ON tb_pedido(status_entrega);

COMMENT ON TABLE tb_pedido IS 'Pedidos de compra com valores financeiros e rastreamento (RF-DB10)';
COMMENT ON COLUMN tb_pedido.taxa_plataforma IS 'Taxa cobrada pela plataforma sobre o valor total';
COMMENT ON COLUMN tb_pedido.valor_liquido_artesao IS 'Valor que o artesão recebe após dedução da taxa';

-- -------------------------------------------------------
-- TB_ITEM_PEDIDO (RF-DB10)
-- Itens individuais de cada pedido com preço unitário
-- congelado no momento da compra.
-- -------------------------------------------------------
CREATE TABLE tb_item_pedido (
    id                  BIGSERIAL       PRIMARY KEY,
    pedido_id           BIGINT          NOT NULL REFERENCES tb_pedido(id) ON DELETE CASCADE,
    produto_id          BIGINT          NOT NULL REFERENCES tb_produto(id),
    quantidade          INTEGER         NOT NULL,
    preco_unitario      DECIMAL(10,2)   NOT NULL
);

CREATE INDEX idx_item_pedido_pedido     ON tb_item_pedido(pedido_id);
CREATE INDEX idx_item_pedido_produto    ON tb_item_pedido(produto_id);

COMMENT ON TABLE tb_item_pedido IS 'Itens individuais de um pedido (RF-DB10)';
COMMENT ON COLUMN tb_item_pedido.preco_unitario IS 'Preço congelado no momento da compra, não muda com alterações futuras do produto';
