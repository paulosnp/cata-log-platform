-- =====================================================
-- V5: Tabela de Compradores
-- Requisito: RF-DB09
-- Regras de Negócio: RN08, RN10
-- =====================================================

-- -------------------------------------------------------
-- TB_COMPRADOR (RF-DB09)
-- Entidade isolada para clientes finais com dados de
-- autenticação, logística e histórico de compras.
-- CPF armazenado sem máscara: VARCHAR(11).
-- -------------------------------------------------------
CREATE TABLE tb_comprador (
    id                              BIGSERIAL       PRIMARY KEY,

    -- Autenticação
    nome                            VARCHAR(150)    NOT NULL,
    email                           VARCHAR(255)    NOT NULL UNIQUE,
    senha                           VARCHAR(255)    NOT NULL,
    cpf                             VARCHAR(11)     UNIQUE,

    -- Contato & Logística
    telefone_whatsapp               VARCHAR(20),
    cep                             VARCHAR(9),
    endereco                        VARCHAR(255),
    numero                          VARCHAR(20),
    complemento                     VARCHAR(100),
    bairro                          VARCHAR(100),
    cidade                          VARCHAR(100),
    estado                          VARCHAR(2),

    -- Controle
    ativo                           BOOLEAN         DEFAULT TRUE,
    email_verificado                BOOLEAN         DEFAULT FALSE,
    codigo_verificacao              VARCHAR(6),
    config_confirmacao_leitura      BOOLEAN         DEFAULT TRUE,

    -- Auditoria
    criado_em                       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em                   TIMESTAMP
);

-- Índices
CREATE INDEX idx_comprador_email    ON tb_comprador(email);
CREATE INDEX idx_comprador_cpf      ON tb_comprador(cpf);

COMMENT ON TABLE tb_comprador IS 'Tabela de compradores/clientes finais (RF-DB09)';
COMMENT ON COLUMN tb_comprador.cpf IS 'CPF armazenado sem máscara, apenas 11 dígitos numéricos';
COMMENT ON COLUMN tb_comprador.config_confirmacao_leitura IS 'RN10: Configura visibilidade de confirmação de leitura no chat';
