-- Migration 004: Schema Multiativo com 13 ClasseAtivo
-- Alinhado com docs/ai/05-data-models.md e Tarefa B (tipos)
-- Data: 2026-04-03

BEGIN;

-- 1. Criar ENUM classe_ativo com 13 classes
-- Alinhado com src/core/domain/types.ts
DO $$ BEGIN
  CREATE TYPE class_ativo AS ENUM (
    'ACAO_BR',
    'FII',
    'ETF_BR',
    'BDR',
    'ACAO_EUA',
    'ETF_EUA',
    'REIT',
    'FUNDO',
    'CRIPTO',
    'RENDA_FIXA',
    'POUPANCA',
    'PREVIDENCIA',
    'ALTERNATIVO'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela carteiras (nova)
CREATE TABLE IF NOT EXISTS carteiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  perfil VARCHAR(20), -- 'conservador', 'moderado', 'arrojado'
  moeda_base VARCHAR(3) DEFAULT 'BRL',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Refatorar tabela ativos com novo schema multiativo
-- Se tabela já existe, renomear para backup antes de recriar
DO $$ BEGIN
  ALTER TABLE ativos RENAME TO ativos_legacy;
EXCEPTION WHEN undefined_table THEN null;
END $$;

CREATE TABLE IF NOT EXISTS ativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(20),
  nome VARCHAR(200) NOT NULL,
  classe class_ativo NOT NULL,
  subclasse VARCHAR(50), -- FII_TIJOLO, CRIPTO_BASE, etc. (vide 03-domain-model.md)
  pais VARCHAR(3), -- BRA, USA, CHN, etc.
  moeda VARCHAR(3) DEFAULT 'BRL',
  setor VARCHAR(100), -- Para ações, FIIs
  segmento VARCHAR(100), -- Para FIIs: logístico, varejo, etc.
  benchmark VARCHAR(30), -- Para fundos
  indexador VARCHAR(50), -- Para renda fixa: IPCA, Selic, etc.
  metadata JSONB, -- Campos dinâmicos por classe
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ativos_classe ON ativos(classe);
CREATE INDEX idx_ativos_ticker ON ativos(ticker);

-- 4. Refatorar tabela posicoes com novo schema
DO $$ BEGIN
  ALTER TABLE posicoes_diarias RENAME TO posicoes_diarias_legacy;
EXCEPTION WHEN undefined_table THEN null;
END $$;

CREATE TABLE IF NOT EXISTS posicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carteira_id UUID NOT NULL REFERENCES carteiras(id) ON DELETE CASCADE,
  ativo_id UUID NOT NULL REFERENCES ativos(id) ON DELETE CASCADE,
  quantidade NUMERIC(20, 8),
  preco_medio NUMERIC(20, 8),
  valor_atual_bruto NUMERIC(20, 2),
  valor_atual_brl NUMERIC(20, 2) NOT NULL, -- Sempre em BRL (Regra 2 - 06-business-rules.md)
  moeda_original VARCHAR(3) DEFAULT 'BRL',
  instituicao VARCHAR(100),
  conta VARCHAR(50),
  custodia VARCHAR(100), -- Para criptos
  data_entrada DATE,
  data_vencimento DATE,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posicoes_carteira ON posicoes(carteira_id);
CREATE INDEX idx_posicoes_ativo ON posicoes(ativo_id);
CREATE INDEX idx_posicoes_moeda ON posicoes(moeda_original);

-- 5. Atualizar tabela contas_corretora para referenciar carteiras (opcional)
-- Por enquanto mantemos como está, pode ser usada para auditoria

-- 6. Criar tabela de auditoria para rastrear mudanças de posições
CREATE TABLE IF NOT EXISTS posicoes_audit (
  id BIGSERIAL PRIMARY KEY,
  posicao_id UUID NOT NULL REFERENCES posicoes(id) ON DELETE CASCADE,
  acao VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario VARCHAR(100),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Função para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar atualizado_em
DROP TRIGGER IF EXISTS trig_ativos_update ON ativos;
CREATE TRIGGER trig_ativos_update
BEFORE UPDATE ON ativos
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trig_carteiras_update ON carteiras;
CREATE TRIGGER trig_carteiras_update
BEFORE UPDATE ON carteiras
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trig_posicoes_update ON posicoes;
CREATE TRIGGER trig_posicoes_update
BEFORE UPDATE ON posicoes
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em();

-- 8. Comments para documentação
COMMENT ON TABLE carteiras IS 'Carteiras de investimento do usuário. Agrupa posições por perfil e estratégia.';
COMMENT ON TABLE ativos IS 'Catálogo de ativos com suporte a 13 classes (ACAO_BR, FII, ETF_BR, BDR, ACAO_EUA, ETF_EUA, REIT, FUNDO, CRIPTO, RENDA_FIXA, POUPANCA, PREVIDENCIA, ALTERNATIVO).';
COMMENT ON TABLE posicoes IS 'Posições do investidor. Sempre com valor_atual_brl consolidado em BRL (Regra 2).';
COMMENT ON COLUMN ativos.classe IS 'ClasseAtivo enum alinhado com src/core/domain/types.ts';
COMMENT ON COLUMN ativos.subclasse IS 'SubclasseAtivo para análise granular (ex: FII_TIJOLO, CRIPTO_BASE).';
COMMENT ON COLUMN posicoes.moeda_original IS 'Moeda original do ativo (Regra 3: manter moeda original).';
COMMENT ON COLUMN posicoes.valor_atual_brl IS 'Sempre consolidado em BRL (Regra 2: não perder valor consolidado).';

COMMIT;
