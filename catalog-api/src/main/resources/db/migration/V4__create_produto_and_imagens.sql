CREATE TABLE tb_produto (
    id                      BIGSERIAL       PRIMARY KEY,
    nome                    VARCHAR(255)    NOT NULL,
    descricao               TEXT,
    preco                   DECIMAL(10,2)   NOT NULL,
    tempo_producao_dias     INTEGER         DEFAULT 0,
    artesao_id              BIGINT          NOT NULL REFERENCES tb_artesao(id) ON DELETE CASCADE,
    categoria_id            BIGINT          REFERENCES tb_categoria(id) ON DELETE SET NULL,
    ativo                   BOOLEAN         DEFAULT TRUE,
    peca_unica              BOOLEAN         DEFAULT TRUE,
    material                VARCHAR(255),
    peso_gramas             INTEGER,
    altura_cm               INTEGER,
    largura_cm              INTEGER,
    comprimento_cm          INTEGER,

    -- Preço final = preco * (1 - percentual_desconto / 100)
    percentual_desconto     INTEGER         DEFAULT 0,
    em_promocao             BOOLEAN         DEFAULT FALSE,

    vendido                 BOOLEAN         DEFAULT FALSE,
    criado_em               TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em           TIMESTAMP
);

CREATE INDEX idx_produto_artesao        ON tb_produto(artesao_id);
CREATE INDEX idx_produto_categoria      ON tb_produto(categoria_id);
CREATE INDEX idx_produto_ativo          ON tb_produto(ativo);
CREATE INDEX idx_produto_preco          ON tb_produto(preco);

-- Busca por similaridade textual (pg_trgm) no nome do produto
CREATE INDEX idx_produto_nome           ON tb_produto USING gin(nome gin_trgm_ops);

CREATE TABLE tb_produto_imagem (
    id              BIGSERIAL       PRIMARY KEY,
    produto_id      BIGINT          NOT NULL REFERENCES tb_produto(id) ON DELETE CASCADE,
    url_imagem      VARCHAR(500)    NOT NULL,
    ordem           INTEGER         DEFAULT 0 NOT NULL
);

CREATE INDEX idx_produto_imagem_produto ON tb_produto_imagem(produto_id);
