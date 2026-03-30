-- =====================================================
-- V2: Tabelas de Administradores e Categorias
-- Requisitos: RF-DB02, RF-DB03
-- Regras de Negócio: RN02, RN04
-- =====================================================

-- -------------------------------------------------------
-- TB_ADMIN (RF-DB02)
-- Tabela dedicada à equipe administrativa.
-- Credenciais de alto privilégio isoladas dos usuários comuns.
-- -------------------------------------------------------
CREATE TABLE tb_admin (
    id                  BIGSERIAL       PRIMARY KEY,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    senha               VARCHAR(255)    NOT NULL,
    senha_temporaria    BOOLEAN         DEFAULT FALSE,
    criado_em           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em       TIMESTAMP
);

COMMENT ON TABLE tb_admin IS 'Tabela de administradores da plataforma (RF-DB02)';
COMMENT ON COLUMN tb_admin.senha_temporaria IS 'Indica se a senha atual é temporária e precisa ser alterada';

-- -------------------------------------------------------
-- TB_CATEGORIA (RF-DB03)
-- Categorias padronizadas para classificação de produtos.
-- Gerenciadas exclusivamente pelos administradores.
-- -------------------------------------------------------
CREATE TABLE tb_categoria (
    id                  BIGSERIAL       PRIMARY KEY,
    nome                VARCHAR(255)    NOT NULL UNIQUE,
    descricao           TEXT,
    ativo               BOOLEAN         DEFAULT TRUE,
    criado_em           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em       TIMESTAMP
);

COMMENT ON TABLE tb_categoria IS 'Categorias de artesanato para classificação de produtos (RF-DB03)';
COMMENT ON COLUMN tb_categoria.ativo IS 'Permite desativar categorias sem excluí-las';
