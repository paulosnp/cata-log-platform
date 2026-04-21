CREATE TABLE tb_admin (
    id                  BIGSERIAL       PRIMARY KEY,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    senha               VARCHAR(255)    NOT NULL,
    senha_temporaria    BOOLEAN         DEFAULT FALSE,
    criado_em           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em       TIMESTAMP
);

CREATE TABLE tb_categoria (
    id                  BIGSERIAL       PRIMARY KEY,
    nome                VARCHAR(255)    NOT NULL UNIQUE,
    descricao           TEXT,
    ativo               BOOLEAN         DEFAULT TRUE,
    criado_em           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em       TIMESTAMP
);
