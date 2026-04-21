CREATE TABLE tb_artesao (
    id                              BIGSERIAL       PRIMARY KEY,
    email                           VARCHAR(255)    NOT NULL UNIQUE,
    senha                           VARCHAR(255)    NOT NULL,
    nome_atelie                     VARCHAR(255),
    biografia                       TEXT,
    telefone_whatsapp               VARCHAR(20),
    ativo                           BOOLEAN         DEFAULT TRUE,
    selo_verificado                 BOOLEAN         DEFAULT FALSE,
    senha_temporaria                BOOLEAN         DEFAULT FALSE,
    codigo_recuperacao              VARCHAR(6),
    validade_codigo                 TIMESTAMP,
    email_verificado                BOOLEAN         DEFAULT FALSE,
    codigo_verificacao              VARCHAR(6),
    cep                             VARCHAR(9),
    estado                          VARCHAR(2),
    cidade                          VARCHAR(100),
    saldo_rendimentos               DECIMAL(10,2)   DEFAULT 0.00,

    -- RN10: Artesão controla se o comprador vê confirmação de leitura no chat
    config_confirmacao_leitura      BOOLEAN         DEFAULT TRUE,

    criado_em                       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em                   TIMESTAMP
);

CREATE INDEX idx_artesao_email      ON tb_artesao(email);
CREATE INDEX idx_artesao_ativo      ON tb_artesao(ativo);
CREATE INDEX idx_artesao_estado     ON tb_artesao(estado);
