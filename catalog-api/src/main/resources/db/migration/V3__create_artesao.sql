-- =====================================================
-- V3: Tabela de Artesãos
-- Requisitos: RF-DB01, RF-DB06 (Recuperação de Senha unificada)
-- Regras de Negócio: RN01, RN07, RN10
-- =====================================================

-- -------------------------------------------------------
-- TB_ARTESAO (RF-DB01 + RF-DB06)
-- Tabela centralizada dos artesãos com campos logísticos,
-- recuperação de senha, privacidade e dashboard financeiro.
-- -------------------------------------------------------
CREATE TABLE tb_artesao (
    id                              BIGSERIAL       PRIMARY KEY,

    -- Autenticação (RN01: email único)
    email                           VARCHAR(255)    NOT NULL UNIQUE,
    senha                           VARCHAR(255)    NOT NULL,

    -- Perfil do Ateliê
    nome_atelie                     VARCHAR(255),
    biografia                       TEXT,
    telefone_whatsapp               VARCHAR(20),

    -- Controle
    ativo                           BOOLEAN         DEFAULT TRUE,
    selo_verificado                 BOOLEAN         DEFAULT FALSE,

    -- Recuperação de Senha (RF-DB06 — campos unificados na criação)
    senha_temporaria                BOOLEAN         DEFAULT FALSE,
    codigo_recuperacao              VARCHAR(6),
    validade_codigo                 TIMESTAMP,

    -- Validação de Email (RN07)
    email_verificado                BOOLEAN         DEFAULT FALSE,
    codigo_verificacao              VARCHAR(6),

    -- Dados Logísticos — obrigatórios para cálculo de frete
    cep                             VARCHAR(9),
    estado                          VARCHAR(2),
    cidade                          VARCHAR(100),

    -- Dashboard Financeiro
    saldo_rendimentos               DECIMAL(10,2)   DEFAULT 0.00,

    -- Privacidade (RN10)
    config_confirmacao_leitura      BOOLEAN         DEFAULT TRUE,

    -- Auditoria
    criado_em                       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em                   TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_artesao_email      ON tb_artesao(email);
CREATE INDEX idx_artesao_ativo      ON tb_artesao(ativo);
CREATE INDEX idx_artesao_estado     ON tb_artesao(estado);

COMMENT ON TABLE tb_artesao IS 'Tabela centralizada dos artesãos da plataforma (RF-DB01)';
COMMENT ON COLUMN tb_artesao.selo_verificado IS 'Selo de curadoria concedido pela equipe administrativa';
COMMENT ON COLUMN tb_artesao.saldo_rendimentos IS 'Saldo acumulado de vendas do artesão';
COMMENT ON COLUMN tb_artesao.config_confirmacao_leitura IS 'RN10: Configura se o comprador vê confirmação de leitura no chat';
