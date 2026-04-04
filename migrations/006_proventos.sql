-- Migration 006: Módulo de Proventos e Cálculo de IR
-- Data: 2026-04-04

BEGIN;

-- ENUM tipo_provento
DO $$ BEGIN
  CREATE TYPE tipo_provento AS ENUM (
    'DIVIDENDO',
    'JCP',
    'RENDA_FII',
    'GCAP',
    'CUPOM',
    'AMORTIZACAO',
    'RENDIMENTO'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Tabela principal de proventos
CREATE TABLE IF NOT EXISTS proventos (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  posicao_id        UUID        REFERENCES posicoes(id) ON DELETE SET NULL,
  carteira_id       UUID        REFERENCES carteiras(id) ON DELETE CASCADE,
  tipo              tipo_provento NOT NULL,
  ticker            VARCHAR(20),
  descricao         TEXT,
  valor_bruto       NUMERIC(20, 2) NOT NULL CHECK (valor_bruto >= 0),
  ir_retido         NUMERIC(20, 2) NOT NULL DEFAULT 0 CHECK (ir_retido >= 0),
  valor_liquido     NUMERIC(20, 2) GENERATED ALWAYS AS (valor_bruto - ir_retido) STORED,
  -- IR adicional a recolher (DARF): calculado pela app, salvo para consulta
  imposto_incidente NUMERIC(20, 2) NOT NULL DEFAULT 0 CHECK (imposto_incidente >= 0),
  data_com          DATE,          -- data com (ex-dividendo)
  data_pagamento    DATE NOT NULL,
  competencia       CHAR(7),       -- 'YYYY-MM' para apuração mensal IR
  observacao        TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proventos_posicao    ON proventos(posicao_id);
CREATE INDEX IF NOT EXISTS idx_proventos_carteira   ON proventos(carteira_id);
CREATE INDEX IF NOT EXISTS idx_proventos_pagamento  ON proventos(data_pagamento DESC);
CREATE INDEX IF NOT EXISTS idx_proventos_competencia ON proventos(competencia);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION trg_proventos_updated()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proventos_updated ON proventos;
CREATE TRIGGER proventos_updated
  BEFORE UPDATE ON proventos
  FOR EACH ROW EXECUTE FUNCTION trg_proventos_updated();

COMMIT;
