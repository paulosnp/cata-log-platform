CREATE TABLE tb_admin_permissao (
    admin_id BIGINT NOT NULL REFERENCES tb_admin(id) ON DELETE CASCADE,
    permissao VARCHAR(50) NOT NULL,
    PRIMARY KEY (admin_id, permissao)
);

-- Admin mestre (seed) recebe TODAS as permissões
INSERT INTO tb_admin_permissao (admin_id, permissao)
SELECT id, unnest(ARRAY[
    'VER_DASHBOARD',
    'GERENCIAR_ARTESAOS',
    'GERENCIAR_COMPRADORES',
    'VER_RELATORIOS',
    'GERENCIAR_ADMINS'
])
FROM tb_admin WHERE email = 'admin@catalog.com.br';
