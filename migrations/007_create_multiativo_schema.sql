-- 007_create_multiativo_schema.sql
-- Migration inicial para suporte a multiativo (GerInvest)

CREATE TABLE asset_classes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(32) UNIQUE NOT NULL, -- Ex: 'ACAO_BR', 'FII'
  nome VARCHAR(64) NOT NULL,
  descricao TEXT
);

CREATE TABLE asset_subclasses (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(32) UNIQUE NOT NULL, -- Ex: 'FII_TIJOLO'
  nome VARCHAR(64) NOT NULL,
  asset_class_id INTEGER REFERENCES asset_classes(id) ON DELETE CASCADE,
  descricao TEXT
);

CREATE TABLE ativos (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(16) NOT NULL,
  nome VARCHAR(128) NOT NULL,
  isin VARCHAR(24),
  cnpj VARCHAR(18),
  asset_class_id INTEGER REFERENCES asset_classes(id),
  asset_subclass_id INTEGER REFERENCES asset_subclasses(id),
  status VARCHAR(16) DEFAULT 'ATIVO',
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

CREATE TABLE instituicoes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(128) NOT NULL,
  cnpj VARCHAR(18),
  tipo VARCHAR(32),
  status VARCHAR(16) DEFAULT 'ATIVA'
);

CREATE TABLE contas (
  id SERIAL PRIMARY KEY,
  instituicao_id INTEGER REFERENCES instituicoes(id),
  nome VARCHAR(64) NOT NULL,
  tipo VARCHAR(32),
  status VARCHAR(16) DEFAULT 'ATIVA'
);

CREATE TABLE posicoes (
  id SERIAL PRIMARY KEY,
  ativo_id INTEGER REFERENCES ativos(id),
  conta_id INTEGER REFERENCES contas(id),
  quantidade NUMERIC(20,6) NOT NULL,
  preco_medio NUMERIC(20,6),
  valor_total NUMERIC(20,2),
  data_referencia DATE NOT NULL,
  status VARCHAR(16) DEFAULT 'ATIVA'
);

CREATE INDEX idx_ativos_ticker ON ativos(ticker);
CREATE INDEX idx_posicoes_ativo_id ON posicoes(ativo_id);
CREATE INDEX idx_posicoes_conta_id ON posicoes(conta_id);
