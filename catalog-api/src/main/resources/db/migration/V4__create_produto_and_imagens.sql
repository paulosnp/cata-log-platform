-- =====================================================
-- V4: Tabela de Produtos e Galeria de Imagens
-- Requisitos: RF-DB04, RF-DB08
-- Regras de Negócio: RN05, RN08
-- =====================================================

-- -------------------------------------------------------
-- TB_PRODUTO (RF-DB04)
-- Produtos com atributos físicos (peso e dimensões) para
-- cálculo de frete e percentual de desconto para promoções.
-- RN08: Campos de dimensão como INTEGER.
-- -------------------------------------------------------
CREATE TABLE tb_produto (
    id                      BIGSERIAL       PRIMARY KEY,
    nome                    VARCHAR(255)    NOT NULL,
    descricao               TEXT,
    preco                   DECIMAL(10,2)   NOT NULL,
    tempo_producao_dias     INTEGER         DEFAULT 0,

    -- Relacionamentos
    artesao_id              BIGINT          NOT NULL REFERENCES tb_artesao(id) ON DELETE CASCADE,
    categoria_id            BIGINT          REFERENCES tb_categoria(id) ON DELETE SET NULL,

    -- Controle
    ativo                   BOOLEAN         DEFAULT TRUE,
    peca_unica              BOOLEAN         DEFAULT TRUE,

    -- Atributos Físicos (RN08: todos como INTEGER)
    material                VARCHAR(255),
    peso_gramas             INTEGER,
    altura_cm               INTEGER,
    largura_cm              INTEGER,
    comprimento_cm          INTEGER,

    -- Promoção Matemática (RF-DB04: percentual_desconto default 0)
    percentual_desconto     INTEGER         DEFAULT 0,
    em_promocao             BOOLEAN         DEFAULT FALSE,

    -- Status de Venda
    vendido                 BOOLEAN         DEFAULT FALSE,

    -- Auditoria
    criado_em               TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em           TIMESTAMP
);

-- Índices para performance de busca e filtro
CREATE INDEX idx_produto_artesao        ON tb_produto(artesao_id);
CREATE INDEX idx_produto_categoria      ON tb_produto(categoria_id);
CREATE INDEX idx_produto_ativo          ON tb_produto(ativo);
CREATE INDEX idx_produto_preco          ON tb_produto(preco);
CREATE INDEX idx_produto_nome           ON tb_produto USING gin(nome gin_trgm_ops);

COMMENT ON TABLE tb_produto IS 'Catálogo de produtos dos artesãos (RF-DB04)';
COMMENT ON COLUMN tb_produto.peca_unica IS 'Indica se é peça única (true) ou produção em série';
COMMENT ON COLUMN tb_produto.percentual_desconto IS 'Desconto aplicado ao preço. Preço final = preco * (1 - percentual_desconto/100)';

-- -------------------------------------------------------
-- TB_PRODUTO_IMAGEM (RF-DB08)
-- Galeria de imagens com controle de ordenação (1:N).
-- Ordem 0 = imagem de capa da vitrine.
-- -------------------------------------------------------
CREATE TABLE tb_produto_imagem (
    id              BIGSERIAL       PRIMARY KEY,
    produto_id      BIGINT          NOT NULL REFERENCES tb_produto(id) ON DELETE CASCADE,
    url_imagem      VARCHAR(500)    NOT NULL,
    ordem           INTEGER         DEFAULT 0 NOT NULL
);

CREATE INDEX idx_produto_imagem_produto ON tb_produto_imagem(produto_id);

COMMENT ON TABLE tb_produto_imagem IS 'Galeria de imagens dos produtos, ordem 0 = capa (RF-DB08)';
