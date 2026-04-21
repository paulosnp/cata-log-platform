ALTER TABLE tb_admin
    ALTER COLUMN senha_temporaria SET DEFAULT TRUE;

ALTER TABLE tb_artesao
    ALTER COLUMN nome_atelie TYPE VARCHAR(150);

UPDATE tb_artesao SET cep = '' WHERE cep IS NULL;
ALTER TABLE tb_artesao
    ALTER COLUMN cep SET NOT NULL;

-- Integração com Mercado Pago (Split de Pagamento) e Melhor Envio (Frete)
ALTER TABLE tb_artesao
    ADD COLUMN mp_user_id       VARCHAR(100),
    ADD COLUMN mp_access_token  VARCHAR(255),
    ADD COLUMN me_access_token  VARCHAR(255);

ALTER TABLE tb_comprador
    ALTER COLUMN cpf TYPE VARCHAR(14);

UPDATE tb_comprador SET cep = '' WHERE cep IS NULL;
ALTER TABLE tb_comprador
    ALTER COLUMN cep SET NOT NULL;

ALTER TABLE tb_categoria
    ALTER COLUMN nome TYPE VARCHAR(100);

ALTER TABLE tb_produto
    ALTER COLUMN nome TYPE VARCHAR(150);

ALTER TABLE tb_produto
    ALTER COLUMN material TYPE VARCHAR(100);

UPDATE tb_produto SET categoria_id = 1 WHERE categoria_id IS NULL;
ALTER TABLE tb_produto
    ALTER COLUMN categoria_id SET NOT NULL;

ALTER TABLE tb_produto_imagem
    ALTER COLUMN ordem SET DEFAULT 1;

UPDATE tb_encomenda_personalizada SET observacoes_cliente = '' WHERE observacoes_cliente IS NULL;
ALTER TABLE tb_encomenda_personalizada
    ALTER COLUMN observacoes_cliente SET NOT NULL;

ALTER TABLE tb_encomenda_personalizada
    ADD COLUMN data_aceite TIMESTAMP;

-- Escrow: 30% do preço acordado, retido em conta garantia até conclusão
ALTER TABLE tb_encomenda_personalizada
    ADD COLUMN valor_retido DECIMAL(10,2);

-- Fee: taxa aplicada em cancelamentos após acordo (CANCELADO_COM_TAXA)
ALTER TABLE tb_encomenda_personalizada
    ADD COLUMN taxa_cancelamento DECIMAL(10,2);

ALTER TABLE tb_log_auditoria
    ALTER COLUMN entidade_afetada TYPE VARCHAR(100);
