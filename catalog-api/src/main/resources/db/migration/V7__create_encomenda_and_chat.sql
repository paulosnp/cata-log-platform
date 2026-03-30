-- =====================================================
-- V7: Encomendas Personalizadas e Chat
-- Requisito: RF-DB11
-- Regras de Negócio: RN05, RN09, RN10
-- =====================================================

-- -------------------------------------------------------
-- TB_ENCOMENDA_PERSONALIZADA (RF-DB11)
-- Vinculada a uma peça de referência da vitrine.
-- Permite negociação direta entre comprador e artesão.
-- -------------------------------------------------------
CREATE TABLE tb_encomenda_personalizada (
    id                      BIGSERIAL       PRIMARY KEY,
    comprador_id            BIGINT          NOT NULL REFERENCES tb_comprador(id),
    artesao_id              BIGINT          NOT NULL REFERENCES tb_artesao(id),
    produto_referencia_id   BIGINT          REFERENCES tb_produto(id),

    -- Detalhes da Encomenda
    observacoes_cliente     TEXT,
    preco_proposto          DECIMAL(10,2),
    tempo_producao_dias     INTEGER,

    -- Status (RF-DB11: default AGUARDANDO_ARTESAO)
    status                  VARCHAR(50)     DEFAULT 'AGUARDANDO_ARTESAO',

    -- Auditoria
    criado_em               TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em           TIMESTAMP
);

CREATE INDEX idx_encomenda_comprador    ON tb_encomenda_personalizada(comprador_id);
CREATE INDEX idx_encomenda_artesao      ON tb_encomenda_personalizada(artesao_id);
CREATE INDEX idx_encomenda_status       ON tb_encomenda_personalizada(status);

COMMENT ON TABLE tb_encomenda_personalizada IS 'Encomendas personalizadas com negociação direta (RF-DB11)';
COMMENT ON COLUMN tb_encomenda_personalizada.produto_referencia_id IS 'Peça de referência da vitrine usada como base para a encomenda';

-- -------------------------------------------------------
-- TB_CHAT_ENCOMENDA (RF-DB11)
-- Chat privado entre comprador e artesão vinculado à encomenda.
-- Suporte a recibo de leitura (RN09) e privacidade (RN10).
-- -------------------------------------------------------
CREATE TABLE tb_chat_encomenda (
    id                  BIGSERIAL       PRIMARY KEY,
    encomenda_id        BIGINT          NOT NULL REFERENCES tb_encomenda_personalizada(id) ON DELETE CASCADE,
    remetente_tipo      VARCHAR(20)     NOT NULL,
    mensagem            TEXT            NOT NULL,
    data_envio          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_leitura        TIMESTAMP
);

CREATE INDEX idx_chat_encomenda         ON tb_chat_encomenda(encomenda_id);
CREATE INDEX idx_chat_data_envio        ON tb_chat_encomenda(data_envio);

COMMENT ON TABLE tb_chat_encomenda IS 'Mensagens do chat de encomendas personalizadas (RF-DB11)';
COMMENT ON COLUMN tb_chat_encomenda.remetente_tipo IS 'COMPRADOR ou ARTESAO — identifica quem enviou a mensagem';
COMMENT ON COLUMN tb_chat_encomenda.data_leitura IS 'RN09: Timestamp de leitura, null = não lida. Visibilidade controlada por config_confirmacao_leitura (RN10)';
