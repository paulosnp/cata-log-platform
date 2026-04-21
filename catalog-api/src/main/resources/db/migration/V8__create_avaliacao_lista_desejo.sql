-- RN11: Um comprador só pode avaliar um produto uma vez (UNIQUE constraint)
CREATE TABLE tb_avaliacao (
    id                  BIGSERIAL       PRIMARY KEY,
    produto_id          BIGINT          NOT NULL REFERENCES tb_produto(id) ON DELETE CASCADE,
    comprador_id        BIGINT          NOT NULL REFERENCES tb_comprador(id),
    nota                INTEGER         NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario          TEXT,
    data_avaliacao      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,

    UNIQUE(produto_id, comprador_id)
);

CREATE INDEX idx_avaliacao_produto      ON tb_avaliacao(produto_id);
CREATE INDEX idx_avaliacao_comprador    ON tb_avaliacao(comprador_id);

-- Produto aparece apenas uma vez na lista de cada comprador
CREATE TABLE tb_lista_desejo (
    id                  BIGSERIAL       PRIMARY KEY,
    comprador_id        BIGINT          NOT NULL REFERENCES tb_comprador(id) ON DELETE CASCADE,
    produto_id          BIGINT          NOT NULL REFERENCES tb_produto(id) ON DELETE CASCADE,
    data_adicao         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,

    UNIQUE(comprador_id, produto_id)
);

CREATE INDEX idx_lista_desejo_comprador ON tb_lista_desejo(comprador_id);
