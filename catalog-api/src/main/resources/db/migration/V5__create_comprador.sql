CREATE TABLE tb_comprador (
    id                              BIGSERIAL       PRIMARY KEY,
    nome                            VARCHAR(150)    NOT NULL,
    email                           VARCHAR(255)    NOT NULL UNIQUE,
    senha                           VARCHAR(255)    NOT NULL,
    cpf                             VARCHAR(11)     UNIQUE,
    telefone_whatsapp               VARCHAR(20),
    cep                             VARCHAR(9),
    endereco                        VARCHAR(255),
    numero                          VARCHAR(20),
    complemento                     VARCHAR(100),
    bairro                          VARCHAR(100),
    cidade                          VARCHAR(100),
    estado                          VARCHAR(2),
    ativo                           BOOLEAN         DEFAULT TRUE,
    email_verificado                BOOLEAN         DEFAULT FALSE,
    codigo_verificacao              VARCHAR(6),

    -- RN10: Comprador controla se o artesão vê confirmação de leitura no chat
    config_confirmacao_leitura      BOOLEAN         DEFAULT TRUE,

    criado_em                       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em                   TIMESTAMP
);

CREATE INDEX idx_comprador_email    ON tb_comprador(email);
CREATE INDEX idx_comprador_cpf      ON tb_comprador(cpf);
