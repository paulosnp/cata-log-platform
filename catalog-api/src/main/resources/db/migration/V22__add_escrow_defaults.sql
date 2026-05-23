-- Escrow: garantir default 0 para valor_retido em registros existentes
UPDATE tb_encomenda_personalizada SET valor_retido = 0 WHERE valor_retido IS NULL;
ALTER TABLE tb_encomenda_personalizada ALTER COLUMN valor_retido SET DEFAULT 0;
