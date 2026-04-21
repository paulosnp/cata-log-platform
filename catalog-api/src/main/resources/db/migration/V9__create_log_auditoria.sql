CREATE TABLE tb_log_auditoria (
    id                      BIGSERIAL       PRIMARY KEY,
    admin_id                BIGINT          REFERENCES tb_admin(id),
    artesao_id              BIGINT          REFERENCES tb_artesao(id),
    comprador_id            BIGINT          REFERENCES tb_comprador(id),
    acao                    VARCHAR(255)    NOT NULL,
    detalhes                TEXT,
    entidade_afetada        VARCHAR(255),
    entidade_id             BIGINT,
    data_hora               TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- RN02: Logs são IMUTÁVEIS — bloqueia UPDATE e DELETE via trigger
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

CREATE INDEX idx_log_admin              ON tb_log_auditoria(admin_id);
CREATE INDEX idx_log_artesao            ON tb_log_auditoria(artesao_id);
CREATE INDEX idx_log_comprador          ON tb_log_auditoria(comprador_id);
CREATE INDEX idx_log_acao               ON tb_log_auditoria(acao);
CREATE INDEX idx_log_data_hora          ON tb_log_auditoria(data_hora);
CREATE INDEX idx_log_entidade           ON tb_log_auditoria(entidade_afetada, entidade_id);
