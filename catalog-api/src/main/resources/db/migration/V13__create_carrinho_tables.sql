CREATE TABLE tb_carrinho (
    id              BIGSERIAL   PRIMARY KEY,
    comprador_id    BIGINT      NOT NULL UNIQUE REFERENCES tb_comprador(id),
    criado_em       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em   TIMESTAMP
);

CREATE TABLE tb_item_carrinho (
    id              BIGSERIAL   PRIMARY KEY,
    carrinho_id     BIGINT      NOT NULL REFERENCES tb_carrinho(id) ON DELETE CASCADE,
    produto_id      BIGINT      NOT NULL REFERENCES tb_produto(id),
    quantidade      INTEGER     NOT NULL DEFAULT 1,

    CONSTRAINT uk_carrinho_produto UNIQUE (carrinho_id, produto_id)
);

CREATE INDEX idx_item_carrinho_carrinho ON tb_item_carrinho(carrinho_id);
