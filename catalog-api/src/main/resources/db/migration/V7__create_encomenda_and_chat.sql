CREATE TABLE tb_encomenda_personalizada (
    id                      BIGSERIAL       PRIMARY KEY,
    comprador_id            BIGINT          NOT NULL REFERENCES tb_comprador(id),
    artesao_id              BIGINT          NOT NULL REFERENCES tb_artesao(id),
    produto_referencia_id   BIGINT          REFERENCES tb_produto(id),
    observacoes_cliente     TEXT,
    preco_proposto          DECIMAL(10,2),
    tempo_producao_dias     INTEGER,
    status                  VARCHAR(50)     DEFAULT 'AGUARDANDO_ARTESAO',
    criado_em               TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em           TIMESTAMP
);

CREATE INDEX idx_encomenda_comprador    ON tb_encomenda_personalizada(comprador_id);
CREATE INDEX idx_encomenda_artesao      ON tb_encomenda_personalizada(artesao_id);
CREATE INDEX idx_encomenda_status       ON tb_encomenda_personalizada(status);

-- RN09/RN10: Chat privado com recibo de leitura controlado por config_confirmacao_leitura
CREATE TABLE tb_chat_encomenda (
    id                  BIGSERIAL       PRIMARY KEY,
    encomenda_id        BIGINT          NOT NULL REFERENCES tb_encomenda_personalizada(id) ON DELETE CASCADE,
    remetente_tipo      VARCHAR(20)     NOT NULL,
    mensagem            TEXT            NOT NULL,
    data_envio          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_leitura        TIMESTAMP
);

CREATE INDEX idx_chat_encomenda         ON tb_chat_encomenda(encomenda_id);
CREATE INDEX idx_chat_data_envio        ON tb_chat_encomenda(data_envio);
