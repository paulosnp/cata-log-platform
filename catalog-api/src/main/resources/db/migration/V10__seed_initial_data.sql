-- =====================================================
-- V10: Seed de Dados Iniciais (Idempotente)
-- Requisito: RF-DB05
-- Regra de Negócio: RN02, RN04
-- =====================================================

-- -------------------------------------------------------
-- ADMIN MESTRE (RF-DB05)
-- Email: admin@catalog.com.br
-- Senha: CatalogAdmin123! (hash BCrypt abaixo)
-- Lógica: Inserir apenas se não existir.
-- -------------------------------------------------------
INSERT INTO tb_admin (email, senha)
SELECT 'admin@catalog.com.br',
       '$2b$10$kGsRHsJiaDr6P9JQ1SpWnObDDnOg10GWabJcGOt3hyHE5a3aRe1x6'
WHERE NOT EXISTS (
    SELECT 1 FROM tb_admin WHERE email = 'admin@catalog.com.br'
);

-- -------------------------------------------------------
-- CATEGORIAS PADRÃO (RF-DB05 + RN04)
-- 5 categorias da cultura pernambucana.
-- ON CONFLICT DO NOTHING: idempotência para evitar
-- duplicação em caso de restart (RF-DB05).
-- -------------------------------------------------------
INSERT INTO tb_categoria (nome, descricao) VALUES
    ('Cerâmica e Barro',
     'Peças artesanais em cerâmica e barro, incluindo utilitários, decorativos e esculturas tradicionais.'),
    ('Xilogravura e Cordel',
     'Arte em xilogravura e literatura de cordel, expressões culturais emblemáticas do Nordeste.'),
    ('Rendas e Bordados',
     'Trabalhos em renda renascença, labirinto, richelieu e bordados manuais tradicionais.'),
    ('Entalhe em Madeira',
     'Esculturas, santos, carrancas e peças decorativas entalhadas à mão em madeira.'),
    ('Arte em Couro',
     'Bolsas, sandálias, cintos e acessórios produzidos artesanalmente em couro.')
ON CONFLICT (nome) DO NOTHING;
