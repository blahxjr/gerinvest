-- =============================================================
-- reset.sql — Limpa o banco para testes iniciais
-- Uso: psql -U postgres -d gerinvest -f scripts/reset.sql
--
-- ⚠️  ATENÇÃO: apaga TODOS os dados (posições, ativos, carteiras,
--             proventos, usuários). Use somente em ambiente local.
-- =============================================================

BEGIN;

-- Proventos (tabela criada pela migration 006 — ignora se não existir)
DO $$ BEGIN
  DELETE FROM proventos;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Tabela proventos não existe — pulando.';
END $$;

-- Posições e auditoria
DELETE FROM posicoes_audit;
DELETE FROM posicoes;

-- Ativos e carteiras
DELETE FROM ativos;
DELETE FROM carteiras;

-- Autenticação
DO $$ BEGIN
  DELETE FROM verification_tokens;
EXCEPTION WHEN undefined_table THEN null;
END $$;

DELETE FROM sessions;
DELETE FROM accounts;
DELETE FROM users;

COMMIT;

SELECT 'Banco limpo com sucesso.' AS status;
