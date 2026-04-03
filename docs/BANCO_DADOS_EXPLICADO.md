# 🏗️ ARQUITETURA DO BANCO DE DADOS — Esclarecimentos

## 1️⃣ Qual Banco de Dados?

### Resposta: **PostgreSQL** ✅

```
Configuração:
├─ Driver: pg (node-postgres)
├─ Conexão: DATABASE_URL (variável de ambiente)
├─ Pool: Connection pooling (reutiliza conexões)
├─ Versionamento: Migrations (004_multiativo_schema.sql)
└─ Ambiente: Local (localhost:5432) + escalável para cloud
```

### Instalação
```bash
# PostgreSQL deve estar rodando localmente
# Criar banco:
createdb gerinvest

# Variável de ambiente:
# .env.local ou process.env.DATABASE_URL
DATABASE_URL=postgresql://user:password@localhost:5432/gerinvest
```

---

## 2️⃣ Os Ativos Vão Ser Migrados Quando Criar Carteira?

### Resposta: **NÃO, e aqui está por quê:**

### 📊 Modelo de Dados

```
┌──────────────────────────────────────────────────────┐
│                    CARTEIRAS                         │
│  (Agrupamentos lógicos de investimentos)             │
│                                                       │
│  Carteira 1: "Investimentos Pessoais"  ───┐         │
│  Carteira 2: "Reserva de Emergência"  ───┤         │
│  Carteira 3: "Fundo Educação Filhos"  ───┤         │
│                                          │          │
└──────────────────────────────────────────┼──────────┘
                                           │
                                    ┌──────▼──────┐
                                    │  POSIÇÕES   │
                                    │ (Holdings)  │
                                    └──────┬──────┘
                                           │
        ┌──────────────────────────────────┴───┬────────────────────────┐
        │                                      │                        │
   ┌────▼─────────┐   ┌────────────────┐  ┌──▼──────────┐  ┌──────────▼────┐
   │ Posição 1    │   │  Posição 2     │  │ Posição 3   │  │  Posição 4    │
   │ 100 PETR4    │   │  50 VFIIC      │  │ 10 KNHC11   │  │  0.05 BTC     │
   │ @R$ 25.50    │   │  @R$ 100.00    │  │ @R$ 100     │  │  @USD 50k     │
   └────┬─────────┘   └────────┬───────┘  └──┬──────────┘  └──────────┬────┘
        │                      │             │                       │
        └──────────────────────┴─────────────┴───────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┬──────────────┐
        │                                             │              │
    ┌───▼────────┐   ┌────────────────┐   ┌──────────▼──┐   ┌───────▼─────┐
    │  PETR4     │   │  VFIIC         │   │  KNHC11    │   │  BTC        │
    │ (Ativo)    │   │ (Ativo)        │   │  (Ativo)   │   │  (Ativo)    │
    │ ACAO_BR    │   │ ETF_BR         │   │  FII       │   │  CRIPTO     │
    └────────────┘   └────────────────┘   └────────────┘   └─────────────┘

IMPORTANTE: Os ATIVOS são compartilhados globalmente!
```

### 🔑 Conceito-Chave: **Muitos-para-Muitos**

```
1 ATIVO pode estar em MÚLTIPLAS CARTEIRAS

Exemplo real:
┌─────────────────────────────────────────────┐
│ Ativo: PETR4 (criado UMA VEZ no banco)     │
├─────────────────────────────────────────────┤
│ Pode estar em:                              │
│  ✓ Carteira 1 "Pessoais" → 100 ações       │
│  ✓ Carteira 2 "Emergência" → 50 ações      │
│  ✓ Carteira 3 "Educação" → 200 ações       │
│  ✓ Carteira 4 "Aposentadoria" → 300 ações  │
│                                             │
│  Total: 1 ativo, 4 carteiras, 4 posições   │
└─────────────────────────────────────────────┘
```

---

## 3⃣ O que é uma Carteira?

### **NÃO é uma conta de corretora** ⚠️
### **É um agrupamento lógico de investimentos**

### Exemplos de Carteiras:

#### Opção A: Por Perfil/Estratégia (RECOMENDADO)
```
Carteira 1: "Investimentos Conservadores"
  └─ Perfil: Conservador
  └─ Moeda: BRL
  └─ Posições: CDB, Tesouro, Poupança
  └─ Objetivo: Segurança, renda passiva

Carteira 2: "Growth Agressivo"
  └─ Perfil: Arrojado
  └─ Moeda: BRL + USD
  └─ Posições: Ações tech, Cripto, Pequenas
  └─ Objetivo: Crescimento, especulação

Carteira 3: "Renda Fixa + Fundos"
  └─ Perfil: Moderado
  └─ Moeda: BRL
  └─ Posições: Fundos, CDB, Tesouro
  └─ Objetivo: Balanceado
```

#### Opção B: Por Conta/Corretora (ALTERNATIVo)
```
Carteira 1: "XP Investimentos - Conta Principal"
  └─ Instituição: XP Investimentos
  └─ Conta: 123456789
  └─ Posições: Todas as ações de XP
  └─ Moeda: BRL

Carteira 2: "Interactive Brokers - USA"
  └─ Instituição: Interactive Brokers
  └─ Conta: ABCD1234
  └─ Posições: Ações USA, ETFs USA
  └─ Moeda: USD

Carteira 3: "Nubank - Renda Fixa"
  └─ Instituição: Nubank
  └─ Posições: CDB, Tesouro via Nubank
  └─ Moeda: BRL
```

#### Opção C: Mista (MAIS FLEXÍVEL)
```
Carteira 1: "Portfólio Consolidado"
  └─ Contém ações de XP, Clear, Rico
  └─ Contém FIIs, ETFs, Fundos
  └─ Contém Cripto, Renda Fixa
  └─ É a visão 360° de TUDO

Carteira 2: "Só Meus FIIs"
  └─ Isolado para análise específica
  └─ De diferentes instituições

Carteira 3: "Fundo Educação Filhos"
  └─ Dedicado a objetivo específico
```

---

## 🎯 Exemplo Prático — Como Funciona

### Cenário: João tem 4 contas em 3 corretoras

```
CORRETORA 1: XP Investimentos
├─ Conta: 123456789
├─ Ativos: PETR4 (100), VALE3 (50), VFIIC (30)

CORRETORA 2: Clear Corretora
├─ Conta: 987654321
├─ Ativos: PETR4 (100), ITUB4 (200), KNHC11 (10)

CORRETORA 3: Interactive Brokers
├─ Conta: USABR12345
└─ Ativos: AAPL (10 ações), SPY (5 ETF)
```

### Estratégia A: Uma Carteira por Corretora

```
SQL Criado:
┌─────────────────────────────────────────────────┐
│ Carteiras:                                      │
│  1. "XP Investimentos"                          │
│  2. "Clear Corretora"                           │
│  3. "Interactive Brokers"                       │
│                                                  │
│ Ativos (NÃO duplicados):                        │
│  • PETR4 (cria 1x, usa em Carteira 1 e 2)     │
│  • VALE3 (cria 1x, usa em Carteira 1)         │
│  • VFIIC (cria 1x, usa em Carteira 1)         │
│  • ITUB4 (cria 1x, usa em Carteira 2)         │
│  • KNHC11 (cria 1x, usa em Carteira 2)        │
│  • AAPL (cria 1x, usa em Carteira 3)          │
│  • SPY (cria 1x, usa em Carteira 3)           │
│                                                  │
│ Total: 3 Carteiras, 7 Ativos, 8 Posições      │
└─────────────────────────────────────────────────┘
```

### Resultado no Dashboard

```
Dashboard vê:
├─ TOTAL: R$ [soma de todas carteiras]
├─ Gráfico Alocação: Todas as 8 posições
├─ Gráfico por Instituição:
│  ├─ XP: R$ XXX (3 posições)
│  ├─ Clear: R$ YYY (2 posições)
│  └─ IB: R$ ZZZ (2 posições em USD)
├─ Análises:
│  ├─ Diversificação: Score baseado em 7 ativos diferentes
│  ├─ FIIs: Como KNHC11 está em 2 carteiras
│  └─ Cripto: Nenhuma
```

**KEY INSIGHT**: PETR4 foi criado UMA VEZ, mas está em 2 carteiras com quantidades diferentes!

---

## 📋 Resumo das 3 Estruturas

### ✅ Tabela carteiras
```sql
CREATE TABLE carteiras (
  id UUID PRIMARY KEY,
  nome VARCHAR(255),              -- "XP Investimentos", "Pessoais", etc
  descricao TEXT,
  perfil VARCHAR(50),             -- conservador | moderado | arrojado
  moeda_base VARCHAR(3),          -- BRL, USD, EUR
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

### ✅ Tabela ativos (Global, Compartilhado)
```sql
CREATE TABLE ativos (
  id UUID PRIMARY KEY,
  ticker VARCHAR(50),             -- PETR4, VFIIC, BTC, etc
  nome VARCHAR(255),              -- "Petrobras", "Vanguard Brazil"
  classe VARCHAR(50),             -- 13 tipos: ACAO_BR, ETF_BR, FII, etc
  subclasse VARCHAR(100),         -- Dinâmica por classe
  pais VARCHAR(3),                -- BRA, USA, CHN (ISO 3166)
  moeda VARCHAR(3),               -- BRL, USD, EUR
  setor VARCHAR(100),             -- Para ações
  segmento VARCHAR(100),          -- Para FIIs
  indexador VARCHAR(100),         -- Para renda fixa: IPCA, SELIC
  metadata JSONB,                 -- Campos flexíveis
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

### ✅ Tabela posicoes (Liga Carteira → Ativo)
```sql
CREATE TABLE posicoes (
  id UUID PRIMARY KEY,
  carteira_id UUID REFERENCES carteiras(id),  -- Qual carteira
  ativo_id UUID REFERENCES ativos(id),        -- Qual ativo
  quantidade DECIMAL(20, 8),                  -- Ações, cotas
  preco_medio DECIMAL(20, 2),                 -- Preço unit.
  valor_atual_brl DECIMAL(20, 2),             -- Em BRL
  moeda_original VARCHAR(3),                  -- BRL, USD, etc
  instituicao VARCHAR(255),                   -- Corretora
  conta VARCHAR(50),                          -- Número conta
  data_entrada DATE,
  data_vencimento DATE,                       -- Para renda fixa
  atualizado_em TIMESTAMP
);
```

---

## 🎯 Fluxo Prático — Seu MVP

### Workflow Implementado:

```
1. CRIAR ATIVO (Apenas 1x por ativo único)
   ├─ POST /api/ativos
   ├─ Payload: { ticker, nome, classe, moeda, ... }
   ├─ Resultado: Ativo criado e reutilizável
   └─ Segunda vez que você tenta criar PETR4?
      → Cria outro registro (pode melhorar com UNIQUE constraint depois)

2. CRIAR CARTEIRA (Agrupamento lógico)
   ├─ POST /api/carteiras
   ├─ Payload: { nome, perfil, moedaBase }
   ├─ Resultado: Container vazio pronto para posições
   └─ Pode criar múltiplas

3. CRIAR POSIÇÃO (Liga carteira a ativo)
   ├─ POST /api/posicoes
   ├─ Payload: { carteiraId, ativoId, quantidade, precoMedio, ... }
   ├─ IMPORTANTE: Seleciona carteira no dropdown
   ├─ IMPORTANTE: Seleciona ativo criado ANTES
   └─ Resultado: Posição registrada

4. VER DASHBOARD
   └─ Consolida TODAS as carteiras e posições
```

---

## ⚠️ Diferenças vs o Dashboard Anterior (Tarefa D)

### Antes (Tarefa D): CSV + Array em memória
```
📁 public/data/portfolio-positions.csv
└─ Arquivo único
└─ Sem conceito de "carteira"
└─ Sem multi-instância
└─ Sem análises persistidas
```

### Agora (Tarefa E): PostgreSQL + Banco Relacional
```
🗄️ PostgreSQL (projinvest)
├─ Tabelas estruturadas
├─ Múltiplas carteiras
├─ Reutilização de ativos
├─ Análises persistidas
├─ Suporte a múltiplos usuários (futura)
└─ Escalável
```

---

## 🎬 Resposta Direta às Suas Perguntas

### P1: "Qual banco de dados?"
**R**: PostgreSQL local (localhost:5432) — descrito em `src/lib/db.ts`

### P2: "Os ativos vão ser migrados quando criar carteira?"
**R**: Não! Ativos são globais e reutilizáveis.
- Você cria PETR4 uma vez
- Usa em múltiplas carteiras/posições
- Não se duplica

### P3: "Carteira é estratégia ou conta de corretora?"
**R**: **Ambos são possíveis!** Você escolhe:
- **Opção A**: 1 carteira por estratégia (Conservador, Growth, etc)
- **Opção B**: 1 carteira por corretora (XP, Clear, IB)
- **Opção C**: Mista/Híbrida (como preferir)

A estrutura é agnóstica ao modelo escolhido!

---

## 🚀 Próximo Passo

Recomendo:

1. **Teste MVP** com `docs/QUICK_START.md`
2. **Durante o teste**, escolha ONE estratégia:
   - "Vou organizar por ESTRATÉGIAS" (conservador/moderado/arrojado)
   - "Vou organizar por CORRETORAS" (XP, Clear, IB)
   - "Vou usar AMBAS" (mista)

3. **Depois, temos 2 caminhos**:
   - **Melhoria**: Adicionar UNIQUE constraint em ticker (evita duplicação)
   - **Feature F1**: Importação automática de B3 (usa a mesma estrutura)

---

**Dúvidas?** Estou aqui para esclarecer! 🚀
