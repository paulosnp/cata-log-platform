-- =====================================================
-- V11: Atualização das Regras de Negócio
-- Sistema de Negociação, Escrow e Taxas de Cancelamento
-- =====================================================
-- CHANGELOG (Diff entre DBML v2 e schema atual V1-V10):
--
-- tb_admin ............. senha_temporaria DEFAULT FALSE → TRUE
-- tb_artesao ........... nome_atelie VARCHAR(255) → VARCHAR(150)
--                        cep ........... nullable → NOT NULL
--                        + mp_user_id, mp_access_token, me_access_token
-- tb_comprador ......... cpf VARCHAR(11) → VARCHAR(14)
--                        cep ........... nullable → NOT NULL
-- tb_categoria ......... nome VARCHAR(255) → VARCHAR(100)
-- tb_produto ........... nome VARCHAR(255) → VARCHAR(150)
--                        material VARCHAR(255) → VARCHAR(100)
--                        categoria_id .. nullable → NOT NULL
-- tb_produto_imagem .... ordem DEFAULT 0 → DEFAULT 1
-- tb_encomenda ......... observacoes_cliente nullable → NOT NULL
--                        + data_aceite, valor_retido, taxa_cancelamento
-- tb_log_auditoria ..... entidade_afetada VARCHAR(255) → VARCHAR(100)
-- =====================================================

-- -------------------------------------------------------
-- 1) TB_ADMIN — Senha temporária default TRUE em vez de FALSE
--    (novo admin já nasce com senha temporária)
-- -------------------------------------------------------
ALTER TABLE tb_admin
    ALTER COLUMN senha_temporaria SET DEFAULT TRUE;

COMMENT ON COLUMN tb_admin.senha_temporaria IS 'Default TRUE: novo admin deve trocar a senha no primeiro login';

-- -------------------------------------------------------
-- 2) TB_ARTESAO — Integração financeira + logística
-- -------------------------------------------------------

-- Reduz nome_atelie para VARCHAR(150) conforme novo DBML
ALTER TABLE tb_artesao
    ALTER COLUMN nome_atelie TYPE VARCHAR(150);

-- CEP passa a ser obrigatório (NOT NULL)
-- Preenche registros existentes com string vazia para não violar constraint
UPDATE tb_artesao SET cep = '' WHERE cep IS NULL;
ALTER TABLE tb_artesao
    ALTER COLUMN cep SET NOT NULL;

-- Novas colunas de integração com Mercado Pago e Melhor Envio
ALTER TABLE tb_artesao
    ADD COLUMN mp_user_id       VARCHAR(100),
    ADD COLUMN mp_access_token  VARCHAR(255),
    ADD COLUMN me_access_token  VARCHAR(255);

COMMENT ON COLUMN tb_artesao.mp_user_id IS 'ID do artesão no Mercado Pago (para Split de Pagamento)';
COMMENT ON COLUMN tb_artesao.mp_access_token IS 'Access token OAuth do Mercado Pago do artesão';
COMMENT ON COLUMN tb_artesao.me_access_token IS 'Access token da API do Melhor Envio do artesão';

-- -------------------------------------------------------
-- 3) TB_COMPRADOR — CPF ampliado + CEP obrigatório
-- -------------------------------------------------------

-- CPF VARCHAR(11) → VARCHAR(14) para suportar formato com máscara
ALTER TABLE tb_comprador
    ALTER COLUMN cpf TYPE VARCHAR(14);

-- CEP passa a ser obrigatório
UPDATE tb_comprador SET cep = '' WHERE cep IS NULL;
ALTER TABLE tb_comprador
    ALTER COLUMN cep SET NOT NULL;

COMMENT ON COLUMN tb_comprador.cpf IS 'CPF do comprador — até 14 caracteres (com ou sem máscara)';

-- -------------------------------------------------------
-- 4) TB_CATEGORIA — Nome mais restrito
-- -------------------------------------------------------
ALTER TABLE tb_categoria
    ALTER COLUMN nome TYPE VARCHAR(100);

-- -------------------------------------------------------
-- 5) TB_PRODUTO — Ajustes de tamanho + categoria obrigatória
-- -------------------------------------------------------

-- Reduz nome para VARCHAR(150)
ALTER TABLE tb_produto
    ALTER COLUMN nome TYPE VARCHAR(150);

-- Reduz material para VARCHAR(100)
ALTER TABLE tb_produto
    ALTER COLUMN material TYPE VARCHAR(100);

-- Categoria passa a ser obrigatória (NOT NULL)
-- Atribui categoria padrão (id=1 = Cerâmica e Barro) para registros órfãos
UPDATE tb_produto SET categoria_id = 1 WHERE categoria_id IS NULL;
ALTER TABLE tb_produto
    ALTER COLUMN categoria_id SET NOT NULL;

-- -------------------------------------------------------
-- 6) TB_PRODUTO_IMAGEM — Ordem default 1 (não mais 0)
-- -------------------------------------------------------
ALTER TABLE tb_produto_imagem
    ALTER COLUMN ordem SET DEFAULT 1;

COMMENT ON COLUMN tb_produto_imagem.ordem IS 'Ordem de exibição, default 1 (ordem 1 = capa da vitrine)';

-- -------------------------------------------------------
-- 7) TB_ENCOMENDA_PERSONALIZADA — Escrow + Negociação + Fee
--    Novas colunas para Máquina de Estados de negociação:
--    AGUARDANDO_ARTESAO → AGUARDANDO_COMPRADOR → PRECO_ACORDADO
--                        ↘ CANCELADO_ESTORNO_TOTAL
--                        ↘ CANCELADO_COM_TAXA
-- -------------------------------------------------------

-- Observações do cliente passa a ser obrigatória
UPDATE tb_encomenda_personalizada SET observacoes_cliente = '' WHERE observacoes_cliente IS NULL;
ALTER TABLE tb_encomenda_personalizada
    ALTER COLUMN observacoes_cliente SET NOT NULL;

-- Data de aceite do acordo de preço
ALTER TABLE tb_encomenda_personalizada
    ADD COLUMN data_aceite TIMESTAMP;

-- Valor retido em conta garantia (Escrow) — 30% do preço acordado
ALTER TABLE tb_encomenda_personalizada
    ADD COLUMN valor_retido DECIMAL(10,2);

-- Taxa de cancelamento (Fee) — aplicada em cancelamentos tardios
ALTER TABLE tb_encomenda_personalizada
    ADD COLUMN taxa_cancelamento DECIMAL(10,2);

COMMENT ON COLUMN tb_encomenda_personalizada.data_aceite IS 'Timestamp do acordo de preço entre comprador e artesão';
COMMENT ON COLUMN tb_encomenda_personalizada.valor_retido IS 'Valor retido em Escrow (30% do preço acordado) como garantia';
COMMENT ON COLUMN tb_encomenda_personalizada.taxa_cancelamento IS 'Taxa aplicada em caso de cancelamento após acordo (CANCELADO_COM_TAXA)';

-- -------------------------------------------------------
-- 8) TB_LOG_AUDITORIA — Reduz entidade_afetada
-- -------------------------------------------------------
ALTER TABLE tb_log_auditoria
    ALTER COLUMN entidade_afetada TYPE VARCHAR(100);
