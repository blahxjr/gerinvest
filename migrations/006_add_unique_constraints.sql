-- Migration 006: Adicionar constraints UNIQUE para evitar duplicatas
-- Data: 2026-04-03

BEGIN;

-- 1. Remover duplicatas de carteiras (manter a mais antiga por criado_em)
DELETE FROM carteiras a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (nome) id
  FROM carteiras
  ORDER BY nome, criado_em ASC
);

-- 2. Remover duplicatas de ativos (manter a mais antiga por criado_em)
DELETE FROM ativos a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (ticker) id
  FROM ativos
  WHERE ticker IS NOT NULL
  ORDER BY ticker, criado_em ASC
)
AND a.ticker IS NOT NULL;

-- 3. Adicionar constraint UNIQUE para carteiras
ALTER TABLE carteiras ADD CONSTRAINT uk_carteiras_nome UNIQUE (nome);

-- 4. Criar índice UNIQUE PARTIAL para ativos (suporta NULL)
-- Partial indexes em PostgreSQL: permite NULL múltiplos, mas apenas um valor NOT NULL é único
CREATE UNIQUE INDEX IF NOT EXISTS idx_uk_ativos_ticker ON ativos(ticker) WHERE ticker IS NOT NULL;

-- Comentário
COMMENT ON CONSTRAINT uk_carteiras_nome ON carteiras IS 'Nomes de carteira devem ser únicos';

COMMIT;
