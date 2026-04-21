CREATE TABLE tb_pedido (
    id                          BIGSERIAL       PRIMARY KEY,
    comprador_id                BIGINT          NOT NULL REFERENCES tb_comprador(id),
    status_pagamento            VARCHAR(50)     DEFAULT 'PENDENTE',
    status_entrega              VARCHAR(50)     DEFAULT 'AGUARDANDO_ENVIO',
    id_transacao_mp             VARCHAR(100),
    codigo_rastreio_me          VARCHAR(100),
    valor_total                 DECIMAL(10,2)   NOT NULL,

    -- Margem da plataforma: valor_total = taxa_plataforma + valor_liquido_artesao
    taxa_plataforma             DECIMAL(10,2)   NOT NULL,
    valor_liquido_artesao       DECIMAL(10,2)   NOT NULL,

    data_entrega_realizada      TIMESTAMP,
    criado_em                   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em               TIMESTAMP
);

CREATE INDEX idx_pedido_comprador           ON tb_pedido(comprador_id);
CREATE INDEX idx_pedido_status_pagamento    ON tb_pedido(status_pagamento);
CREATE INDEX idx_pedido_status_entrega      ON tb_pedido(status_entrega);

CREATE TABLE tb_item_pedido (
    id                  BIGSERIAL       PRIMARY KEY,
    pedido_id           BIGINT          NOT NULL REFERENCES tb_pedido(id) ON DELETE CASCADE,
    produto_id          BIGINT          NOT NULL REFERENCES tb_produto(id),
    quantidade          INTEGER         NOT NULL,

    -- Preço congelado no momento da compra (não muda se o produto for alterado depois)
    preco_unitario      DECIMAL(10,2)   NOT NULL
);

CREATE INDEX idx_item_pedido_pedido     ON tb_item_pedido(pedido_id);
CREATE INDEX idx_item_pedido_produto    ON tb_item_pedido(produto_id);
