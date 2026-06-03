INSERT INTO tb_admin (email, senha, senha_temporaria)
SELECT 'paulocardoso64h@gmail.com',
       '$2b$10$EKPbESA4qmWAeMQvrq581.V.nBqStvN/5n0V7HKF7TXpY7GEMySM.',
       FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM tb_admin WHERE email = 'paulocardoso64h@gmail.com'
);

INSERT INTO tb_admin_permissao (admin_id, permissao)
SELECT id, unnest(ARRAY[
    'VER_DASHBOARD',
    'GERENCIAR_ARTESAOS',
    'GERENCIAR_COMPRADORES',
    'VER_RELATORIOS',
    'GERENCIAR_ADMINS'
])
FROM tb_admin WHERE email = 'paulocardoso64h@gmail.com'
ON CONFLICT (admin_id, permissao) DO NOTHING;
