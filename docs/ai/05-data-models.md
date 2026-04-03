# GerInvest — Modelos de Dados Base

## Interface conceitual de posição multiativo

```ts
export type ClasseAtivo =
  | 'ACAO_BR'
  | 'FII'
  | 'ETF_BR'
  | 'BDR'
  | 'ACAO_EUA'
  | 'ETF_EUA'
  | 'REIT'
  | 'FUNDO'
  | 'CRIPTO'
  | 'RENDA_FIXA'
  | 'POUPANCA'
  | 'PREVIDENCIA'
  | 'ALTERNATIVO'

export interface PosicaoInvestimento {
  id: string
  carteiraId: string
  ativoId: string
  classe: ClasseAtivo
  subclasse?: string
  ticker?: string
  nome: string
  quantidade?: number
  precoMedio?: number
  valorAtualBruto?: number
  valorAtualBrl: number
  moedaOriginal: 'BRL' | 'USD' | 'EUR'
  instituicao?: string
  conta?: string
  custodia?: string
  dataEntrada?: string
  dataVencimento?: string
  benchmark?: string
}
```

## Schema SQL inicial recomendado

```sql
CREATE TYPE classe_ativo AS ENUM (
  'ACAO_BR','FII','ETF_BR','BDR','ACAO_EUA','ETF_EUA','REIT',
  'FUNDO','CRIPTO','RENDA_FIXA','POUPANCA','PREVIDENCIA','ALTERNATIVO'
);

CREATE TABLE carteiras (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  perfil VARCHAR(20),
  moeda_base VARCHAR(3) DEFAULT 'BRL',
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ativos (
  id UUID PRIMARY KEY,
  ticker VARCHAR(20),
  nome VARCHAR(200) NOT NULL,
  classe classe_ativo NOT NULL,
  subclasse VARCHAR(50),
  pais VARCHAR(3),
  moeda VARCHAR(3) DEFAULT 'BRL',
  setor VARCHAR(100),
  segmento VARCHAR(100),
  benchmark VARCHAR(30),
  metadata JSONB,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posicoes (
  id UUID PRIMARY KEY,
  carteira_id UUID REFERENCES carteiras(id),
  ativo_id UUID REFERENCES ativos(id),
  quantidade NUMERIC(20,8),
  preco_medio NUMERIC(20,8),
  valor_atual_brl NUMERIC(20,2),
  moeda_original VARCHAR(3) DEFAULT 'BRL',
  instituicao VARCHAR(100),
  conta VARCHAR(50),
  custodia VARCHAR(100),
  data_entrada DATE,
  data_vencimento DATE,
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

## Regra de modelagem

Campos muito específicos por tipo de ativo podem começar em `metadata JSONB`, mas a médio prazo os mais usados devem migrar para colunas explícitas.
