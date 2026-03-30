-- =====================================================
-- V8: Avaliação e Lista de Desejos
-- Requisito: Diagrama MER/DER + RN11 (avaliações)
-- =====================================================

-- -------------------------------------------------------
-- TB_AVALIACAO
-- Um comprador pode avaliar um produto apenas uma vez.
-- Nota de 1 a 5 com CHECK constraint.
-- -------------------------------------------------------
CREATE TABLE tb_avaliacao (
    id                  BIGSERIAL       PRIMARY KEY,
    produto_id          BIGINT          NOT NULL REFERENCES tb_produto(id) ON DELETE CASCADE,
    comprador_id        BIGINT          NOT NULL REFERENCES tb_comprador(id),
    nota                INTEGER         NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario          TEXT,
    data_avaliacao      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Constraint: avaliação única por comprador por produto
    UNIQUE(produto_id, comprador_id)
);

CREATE INDEX idx_avaliacao_produto      ON tb_avaliacao(produto_id);
CREATE INDEX idx_avaliacao_comprador    ON tb_avaliacao(comprador_id);

COMMENT ON TABLE tb_avaliacao IS 'Avaliações de produtos pelos compradores (nota 1-5)';
COMMENT ON COLUMN tb_avaliacao.nota IS 'Nota de 1 a 5 estrelas, validada por CHECK constraint';

-- -------------------------------------------------------
-- TB_LISTA_DESEJO
-- Um produto pode aparecer apenas uma vez na lista
-- de cada comprador (UNIQUE comprador_id + produto_id).
-- -------------------------------------------------------
CREATE TABLE tb_lista_desejo (
    id                  BIGSERIAL       PRIMARY KEY,
    comprador_id        BIGINT          NOT NULL REFERENCES tb_comprador(id) ON DELETE CASCADE,
    produto_id          BIGINT          NOT NULL REFERENCES tb_produto(id) ON DELETE CASCADE,
    data_adicao         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Constraint: produto único por comprador
    UNIQUE(comprador_id, produto_id)
);

CREATE INDEX idx_lista_desejo_comprador ON tb_lista_desejo(comprador_id);

COMMENT ON TABLE tb_lista_desejo IS 'Lista de desejos dos compradores — favoritos da vitrine';
