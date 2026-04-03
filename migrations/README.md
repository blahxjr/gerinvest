# GerInvest — Migrations Guide

## Visão Geral

As migrations criam e evoluem o schema PostgreSQL para suportar o modelo multiativo completo alinhado com **Tarefa B** (tipos) e **Tarefa C** (serviços de análise).

## Estrutura de Migrations

| Arquivo | Propósito | Status |
|---------|-----------|--------|
| `001_create_auth_tables.sql` | Autenticação NextAuth | Existente |
| `003_create_investment_tables.sql` | Schema inicial de investimentos | Existente (legado) |
| `004_multiativo_schema.sql` | **Novo schema com 13 ClasseAtivo** | ✅ Tarefa D |
| `005_sample_data.sql` | Dados de exemplo para teste | ✅ Tarefa D |

## Schema Multiativo (Migration 004)

### 1. ENUM classe_ativo (13 classes)

```sql
CREATE TYPE class_ativo AS ENUM (
  'ACAO_BR', 'FII', 'ETF_BR', 'BDR', 'ACAO_EUA', 'ETF_EUA', 'REIT',
  'FUNDO', 'CRIPTO', 'RENDA_FIXA', 'POUPANCA', 'PREVIDENCIA', 'ALTERNATIVO'
);
```

Alinhado com `src/core/domain/types.ts`:
- `ClasseAtivo` type definido com 13 valores
- Validação no BD (ENUM constraint)
- Compatível com migrations futuras

### 2. Tabela `carteiras`

```sql
CREATE TABLE carteiras (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  perfil VARCHAR(20), -- 'conservador', 'moderado', 'arrojado'
  moeda_base VARCHAR(3) DEFAULT 'BRL',
  criado_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ
);
```

**Propósito:** Agrupar posições por estratégia/perfil do investidor

**Exemplos:**
- "Carteira Principal" → perfil moderado
- "Reserva em Dólar" → perfil conservador
- "Criptos" → perfil arrojado

### 3. Tabela `ativos` (Refatorada)

```sql
CREATE TABLE ativos (
  id UUID PRIMARY KEY,
  ticker VARCHAR(20),
  nome VARCHAR(200) NOT NULL,
  classe class_ativo NOT NULL,
  subclasse VARCHAR(50),
  pais VARCHAR(3),
  moeda VARCHAR(3) DEFAULT 'BRL',
  setor VARCHAR(100),
  segmento VARCHAR(100),
  benchmark VARCHAR(30),
  indexador VARCHAR(50),
  metadata JSONB,
  criado_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ
);
```

**Mudanças em relação a 003:**
- `classe` → agora ENUM (não mais genérico tipo_investimento_id)
- Adicionado `subclasse` (FII_TIJOLO, CRIPTO_BASE, etc.)
- Adicionado `pais` (para renda fixa, criptos, ações internacionais)
- Adicionado `indexador` (para renda fixa: IPCA, Selic, etc.)
- Adicionado `metadata` JSONB (campos específicos por classe)

**Índices:**
- `idx_ativos_classe` (frequente em análises)
- `idx_ativos_ticker` (buscas diretas)

### 4. Tabela `posicoes` (Refatorada)

```sql
CREATE TABLE posicoes (
  id UUID PRIMARY KEY,
  carteira_id UUID NOT NULL REFERENCES carteiras(id),
  ativo_id UUID NOT NULL REFERENCES ativos(id),
  quantidade NUMERIC(20,8),
  preco_medio NUMERIC(20,8),
  valor_atual_bruto NUMERIC(20,2),
  valor_atual_brl NUMERIC(20,2) NOT NULL,
  moeda_original VARCHAR(3) DEFAULT 'BRL',
  instituicao VARCHAR(100),
  conta VARCHAR(50),
  custodia VARCHAR(100),
  data_entrada DATE,
  data_vencimento DATE,
  atualizado_em TIMESTAMPTZ
);
```

**Mudanças:**
- Agora referencia `carteira_id` (não mais `conta_id`)
- `valor_atual_brl` obrigatório (Regra 2: consolidado em BRL)
- Mantém `moeda_original` (Regra 3)
- Adicionado `custodia` (para criptos)

**Regras de Negócio Implementadas:**
- Regra 2: `valor_atual_brl` sempre preenchido
- Regra 3: `moeda_original` preservada

**Índices:**
- `idx_posicoes_carteira`
- `idx_posicoes_ativo`
- `idx_posicoes_moeda` (para análise de exposição cambial)

### 5. Tabela `posicoes_audit`

```sql
CREATE TABLE posicoes_audit (
  id BIGSERIAL PRIMARY KEY,
  posicao_id UUID REFERENCES posicoes(id),
  acao VARCHAR(20),
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario VARCHAR(100),
  criado_em TIMESTAMPTZ
);
```

**Propósito:** Rastrear histórico de mudanças em posições

## Triggers e Funcionalidades

### Trigger: `update_atualizado_em`

Atualiza automaticamente `atualizado_em` em UPDATE para:
- `ativos`
- `carteiras`
- `posicoes`

## Como Usar

### 1. Aplicar Migrations Localmente

```bash
# PostgreSQL client
psql -h localhost -U postgres -d gerinvest -f migrations/004_multiativo_schema.sql
psql -h localhost -U postgres -d gerinvest -f migrations/005_sample_data.sql
```

### 2. Via script Node.js (recomendado para CI/CD)

```typescript
// scripts/migrate.ts (já existe)
import { Pool } from 'pg'
import fs from 'fs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function runMigrations() {
  const migrations = [
    '001_create_auth_tables.sql',
    '003_create_investment_tables.sql',
    '004_multiativo_schema.sql',
    '005_sample_data.sql'
  ]
  
  for (const migration of migrations) {
    const sql = fs.readFileSync(`migrations/${migration}`, 'utf-8')
    console.log(`Running ${migration}...`)
    await pool.query(sql)
  }
  
  await pool.end()
}

runMigrations().catch(console.error)
```

### 3. Via ORM (Prisma, TypeORM)

Para integrar com Prisma:
```typescript
// prisma/migrations/[timestamp]_multiativo.sql
// (copiar conteúdo de 004 + 005)
```

## Compatibilidade

### Com o Schema Legado (003)

- Tabelas antigas renomeadas para `*_legacy` (backup)
- Migrations são idempotentes (`CREATE TABLE IF NOT EXISTS`)
- Sem ON DELETE CASCADE em cascata (segurança)

### Com Código Existente

- `src/core/domain/types.ts`: ClasseAtivo ENUM alinha com BD
- `src/core/services/`: análises usam classe_ativo
- `src/infra/csv/`: importador mantém compatibilidade

## Dados de Exemplo (Migration 005)

### Carteiras
- Carteira Principal (moderado)
- Reserva em Dólar (conservador)
- Criptos Especulativas (arrojado)

### Ativos (1 por classe)
- **ACAO_BR:** PETR4, VALE3
- **FII:** MXRF11, KNRI11
- **ETF_BR:** IVVB11
- **BDR:** AAPL34
- **ACAO_EUA:** AAPL
- **ETF_EUA:** SPY
- **FUNDO:** XPML
- **CRIPTO:** BTC, ETH
- **RENDA_FIXA:** Tesouro Selic, Tesouro IPCA
- **POUPANCA:** Poupança BB
- **PREVIDENCIA:** VGBL

### Posições (~8 posições spread)
- 4 em Carteira Principal
- 2 em Reserva Dólar
- 2 em Criptos

## Melhorias Futuras

### Fase 1 (Tarefa E)
- [ ] Adicionar coluna `taxa_administracao` em fundos
- [ ] Adicionar `data_proximo_dividendo` em ações/FIIs
- [ ] View `v_posicoes_resumo` com valor total por carteira

### Fase 2
- [ ] Histórico de preços (tabela `preco_ativo_historico`)
- [ ] Contribuições/resgates (tabela `movimentacoes`)
- [ ] Alerts personalizados (tabela `alertas_usuario`)

## Troubleshooting

### Erro: "type class_ativo already exists"
- Normal se migration rodou 2x
- Usar `DROP TYPE IF EXISTS class_ativo CASCADE;` antes

### Erro: "relation ativos_legacy does not exist"
- Normal na primeira execução (tabela não tinha dados)
- Seguro continuar

### Erro: "foreign key violation"
- Verificar se `carteira_id` e `ativo_id` existem
- Dados de exemplo (005) insere UUIDs específicos

## Documentação Relacionada

- [docs/ai/03-domain-model.md](../docs/ai/03-domain-model.md) — Entidades
- [docs/ai/05-data-models.md](../docs/ai/05-data-models.md) — Schema SQL
- [docs/ai/06-business-rules.md](../docs/ai/06-business-rules.md) — Regras de consolidação
- [src/core/domain/types.ts](../src/core/domain/types.ts) — ClasseAtivo TypeScript

## Status de Implementação

- ✅ ENUM classe_ativo (13 valores)
- ✅ Tabelas carteiras, ativos (refatorada), posicoes (refatorada)
- ✅ Índices para performance
- ✅ Triggers para auditoria
- ✅ Dados de exemplo
- ⏳ Repository em TypeScript (próx: src/infra/repositories/postgresPortfolioRepository.ts)
- ⏳ API routes para CRUD (próx: app/api/carteiras/*, app/api/ativos/*, app/api/posicoes/*)
