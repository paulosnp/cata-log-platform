-- Admin seed foi criado na V10 com default FALSE (V2). A V11 mudou o default
-- para TRUE, mas só afeta novos registros. Corrige o registro existente.
UPDATE tb_admin
SET senha_temporaria = TRUE
WHERE email = 'admin@catalog.com.br'
  AND senha_temporaria = FALSE;
