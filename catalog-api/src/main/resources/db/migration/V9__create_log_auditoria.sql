-- =====================================================
-- V9: Tabela de Logs de Auditoria (IMUTÁVEL)
-- Requisito: RF-DB07
-- Regra de Negócio: RN02, RN03
-- =====================================================

-- -------------------------------------------------------
-- TB_LOG_AUDITORIA (RF-DB07)
-- Tabela imutável para registro de ações críticas.
-- UPDATE e DELETE são bloqueados por triggers.
-- FKs opcionais: admin_id, artesao_id, comprador_id.
-- -------------------------------------------------------
CREATE TABLE tb_log_auditoria (
    id                      BIGSERIAL       PRIMARY KEY,

    -- Atores do evento (FKs opcionais — apenas um será preenchido por registro)
    admin_id                BIGINT          REFERENCES tb_admin(id),
    artesao_id              BIGINT          REFERENCES tb_artesao(id),
    comprador_id            BIGINT          REFERENCES tb_comprador(id),

    -- Dados do Evento
    acao                    VARCHAR(255)    NOT NULL,
    detalhes                TEXT,
    entidade_afetada        VARCHAR(255),
    entidade_id             BIGINT,
    data_hora               TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- -------------------------------------------------------
-- IMUTABILIDADE (RN02)
-- Triggers que impedem qualquer UPDATE ou DELETE na tabela.
-- Garante conformidade e transparência na curadoria.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_prevent_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Logs de auditoria são imutáveis. Operações UPDATE e DELETE não são permitidas.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_log_update
    BEFORE UPDATE ON tb_log_auditoria
    FOR EACH ROW EXECUTE FUNCTION fn_prevent_log_mutation();

CREATE TRIGGER trg_prevent_log_delete
    BEFORE DELETE ON tb_log_auditoria
    FOR EACH ROW EXECUTE FUNCTION fn_prevent_log_mutation();

-- Índices para consultas de auditoria
CREATE INDEX idx_log_admin              ON tb_log_auditoria(admin_id);
CREATE INDEX idx_log_artesao            ON tb_log_auditoria(artesao_id);
CREATE INDEX idx_log_comprador          ON tb_log_auditoria(comprador_id);
CREATE INDEX idx_log_acao               ON tb_log_auditoria(acao);
CREATE INDEX idx_log_data_hora          ON tb_log_auditoria(data_hora);
CREATE INDEX idx_log_entidade           ON tb_log_auditoria(entidade_afetada, entidade_id);

COMMENT ON TABLE tb_log_auditoria IS 'Logs de auditoria IMUTÁVEIS — ações críticas da plataforma (RF-DB07)';
COMMENT ON COLUMN tb_log_auditoria.acao IS 'Ação registrada, ex: BLOQUEOU_ARTESAO, APROVOU_PRODUTO, REMOVEU_AVALIACAO';
