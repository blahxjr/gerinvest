-- Migration 007: Fortalecer modelo relacional cliente -> instituicao -> conta -> carteira -> posicao
-- Objetivo: separar visoes por cliente, banco, conta e carteira sem duplicar ativo.

BEGIN;

-- 1) Vinculo opcional de cliente na carteira
ALTER TABLE carteiras
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;

ALTER TABLE carteiras
  ADD COLUMN IF NOT EXISTS conta_referencia_id UUID REFERENCES contas_corretora(id) ON DELETE SET NULL;

-- Evita duplicar nome de carteira para o mesmo cliente
CREATE UNIQUE INDEX IF NOT EXISTS uk_carteiras_cliente_nome
  ON carteiras (cliente_id, nome)
  WHERE cliente_id IS NOT NULL;

-- 2) Relacao N:N entre carteira e contas (uma carteira pode consolidar varias contas)
CREATE TABLE IF NOT EXISTS carteira_contas (
  carteira_id UUID NOT NULL REFERENCES carteiras(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES contas_corretora(id) ON DELETE CASCADE,
  papel VARCHAR(20) NOT NULL DEFAULT 'OPERACIONAL', -- OPERACIONAL, RESERVA, OFFSHORE, etc
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (carteira_id, conta_id)
);

CREATE INDEX IF NOT EXISTS idx_carteira_contas_conta_id ON carteira_contas(conta_id);

-- 3) Chaves relacionais em posicoes (mantem colunas legadas instituicao/conta por compatibilidade)
ALTER TABLE posicoes
  ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES contas_corretora(id) ON DELETE SET NULL;

ALTER TABLE posicoes
  ADD COLUMN IF NOT EXISTS instituicao_id UUID REFERENCES instituicoes(id) ON DELETE SET NULL;

ALTER TABLE posicoes
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;

ALTER TABLE posicoes
  ADD COLUMN IF NOT EXISTS origem_dado VARCHAR(30) DEFAULT 'MANUAL'; -- MANUAL, B3, GOOGLE_SHEETS, API

ALTER TABLE posicoes
  ADD COLUMN IF NOT EXISTS importado_em TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_posicoes_conta_id ON posicoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_posicoes_instituicao_id ON posicoes(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_posicoes_cliente_id ON posicoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_posicoes_carteira_conta ON posicoes(carteira_id, conta_id);

-- 4) Backfill: tenta resolver conta/instituicao/cliente a partir dos campos textuais legados
UPDATE posicoes p
SET
  conta_id = cc.id,
  instituicao_id = cc.instituicao_id,
  cliente_id = cc.cliente_id
FROM contas_corretora cc
JOIN instituicoes i ON i.id = cc.instituicao_id
WHERE p.conta_id IS NULL
  AND p.conta IS NOT NULL
  AND p.instituicao IS NOT NULL
  AND lower(trim(cc.numero_conta)) = lower(trim(p.conta))
  AND lower(trim(i.nome)) = lower(trim(p.instituicao));

-- 5) Backfill de carteira_contas para refletir o que ja existe em posicoes
INSERT INTO carteira_contas (carteira_id, conta_id)
SELECT DISTINCT p.carteira_id, p.conta_id
FROM posicoes p
WHERE p.conta_id IS NOT NULL
ON CONFLICT (carteira_id, conta_id) DO NOTHING;

-- 6) View consolidada para consultas e dashboards
CREATE OR REPLACE VIEW vw_posicoes_relacionais AS
SELECT
  p.id AS posicao_id,
  p.atualizado_em,
  p.origem_dado,
  p.importado_em,

  c.id AS carteira_id,
  c.nome AS carteira_nome,
  c.perfil AS carteira_perfil,

  cli.id AS cliente_id,
  cli.nome AS cliente_nome,
  cli.documento AS cliente_documento,

  cc.id AS conta_id,
  cc.numero_conta,
  cc.apelido AS conta_apelido,

  inst.id AS instituicao_id,
  inst.nome AS instituicao_nome,

  a.id AS ativo_id,
  a.ticker,
  a.nome AS ativo_nome,
  a.classe,
  a.subclasse,
  a.moeda AS moeda_ativo,

  p.moeda_original,
  p.quantidade,
  p.preco_medio,
  p.valor_atual_bruto,
  p.valor_atual_brl,
  p.data_entrada,
  p.data_vencimento
FROM posicoes p
JOIN ativos a ON a.id = p.ativo_id
JOIN carteiras c ON c.id = p.carteira_id
LEFT JOIN clientes cli ON cli.id = COALESCE(p.cliente_id, c.cliente_id)
LEFT JOIN contas_corretora cc ON cc.id = p.conta_id
LEFT JOIN instituicoes inst ON inst.id = COALESCE(p.instituicao_id, cc.instituicao_id);

COMMENT ON VIEW vw_posicoes_relacionais IS
  'Consulta detalhada para filtros por cliente, instituicao, conta, carteira e classe de ativo.';

COMMIT;
