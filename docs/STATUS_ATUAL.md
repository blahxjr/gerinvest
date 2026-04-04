# GerInvest — Status Atual do Projeto
> Gerado em: 04/04/2026 | Revisão completa de código

---

## 1. Visão Geral do Projeto

**GerInvest** (nome interno: ProjInvest) é uma aplicação web de gestão de carteira de investimentos brasileira, voltada para assessores e investidores pessoas físicas. Permite importar planilhas Excel da B3/corretoras, visualizar posições, acompanhar proventos e calcular IR.

### Stack atual
| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js App Router | 16.2.1 |
| Linguagem | TypeScript strict | 5.x |
| UI | React + Tailwind CSS v4 | 19.2 / 4.x |
| Componentes | Radix UI + shadcn/ui | latest |
| Tabelas | TanStack Table | v8.21 |
| Gráficos | Recharts | v3.8 |
| Auth | NextAuth.js v4 + bcryptjs | 4.24 |
| Banco | PostgreSQL via `pg` | 8.20 |
| Excel/CSV | ExcelJS + csv-parse | 4.4 / 6.2 |
| Cotações | BRAPI (Axios) | 1.0 |
| ORM | Nenhum — SQL puro com Pool |  |
| Estado global | Server Components + `unstable_cache` | — |
| Forms | react-hook-form + Zod v4 | 7.72 / 4.3 |
| Ícones | lucide-react | 1.7 |

---

## 2. Arquitetura de Camadas

```
app/                    → Pages e API routes (Next.js App Router)
├── page.tsx            → Dashboard (Server Component + unstable_cache)
├── api/                → 14 grupos de rotas REST
├── proventos/          → Módulo proventos
├── posicoes/           → Listagem de posições
├── importacao/         → Página de relatórios
└── cadastro/           → Configurações

src/
├── core/
│   ├── domain/         → Tipos puros (ClasseAtivo, Position, Provento…)
│   └── services/       → Lógica de negócio sem I/O (portfolioService, impostoService…)
├── infra/
│   ├── csv/            → Importador Excel, helpers, csv-reader/writer
│   ├── repositories/   → CsvPortfolioRepository + PostgresPortfolioRepository
│   └── services/       → brapiService (cotações ao vivo)
├── lib/                → db.ts, auth.ts, authGuard.ts, googleSheets.ts
└── ui/
    └── components/     → Componentes React puros

components/             → app-sidebar.tsx, theme-toggle.tsx (root-level)
migrations/             → 6 arquivos SQL
```

---

## 3. Histórico de Entregas (por fase)

### ✅ P0 — Infraestrutura inicial
- Configuração Next.js 16 + TypeScript strict
- PostgreSQL local + script de diagnóstico
- Middleware de autenticação JWT

### ✅ P1 — Limpeza e segurança
- Remoção de credenciais hardcoded
- Substituição de `xlsx` (vulnerável) por `exceljs`
- Resolução de conflitos `@auth/pg-adapter`

### ✅ P2 — Design System
- Integração shadcn/ui e Radix UI
- Componentes: `KpiCard`, `DataTable` (TanStack), `EmptyState`, `AppLayout`
- Recharts instalado para gráficos

### ✅ P3 — Módulo Proventos + IR
- Migration `006_proventos.sql` (tabela + ENUM `tipo_provento`)
- Domínio: `provento.ts` com Zod schema
- `proventosService.ts` — CRUD completo no Postgres
- `impostoService.ts` — regras tributárias BR 2026 (GCAP, JCP, isenções FII/DIPJ)
- API routes: `GET/POST /api/proventos`, `GET/PUT/DELETE /api/proventos/[id]`
- Página `app/proventos/page.tsx` com tabela interativa e modal de lançamento

### ✅ P4 — Cotações ao vivo (BRAPI)
- `src/infra/services/brapiService.ts` — busca em lotes de 15 tickers, silent fail
- `getMarkToMarketMetrics()` no `portfolioService.ts`
- Integração no `app/page.tsx` com `unstable_cache` de 5 min
- KPIs de Marcação a Mercado e P/L Não Realizado no dashboard

### ✅ P5 — UI Premium
- Design glassmorphism: paleta sky/teal/lime/amber, classe `.glass`
- `app-sidebar.tsx` reescrito: drawer mobile, 8 itens de menu, lucide icons
- Header sticky com `ThemeToggle` (dark/light com localStorage)
- `KpiCard` com Sparkline SVG e efeitos hover
- `PortfolioOverview` com 7 KPIs + barra de diversificação
- `DistributionCharts` e `AllocationCharts` com Recharts
- Skeleton de loading e `EmptyState` premium na tabela
- `app/loading.tsx` e `app/error.tsx`

### ✅ P5 Hardening — Lint cleanup
- **0 erros de lint** (18 warnings estruturais não eliminables)
- Removidos todos `any` explícitos → `unknown` + type narrowing
- Corrigidos: `prefer-const`, imports não usados, `require` em scripts
- `DataTable.tsx`: `'use no memo'` para compatibilidade React Compiler
- Modais: tratamento correto de `err: unknown`

---

## 4. Banco de Dados — Schema Atual

### Migrations aplicadas
| Arquivo | Conteúdo | Status |
|---------|----------|--------|
| `001_create_auth_tables.sql` | `users`, `accounts`, `sessions`, `verification_tokens` | ✅ |
| `003_create_investment_tables.sql` | Tabelas legacy de investimentos | ✅ |
| `004_multiativo_schema.sql` | `carteiras`, `ativos` (ENUM 13 classes), `posicoes` | ✅ |
| `005_sample_data.sql` | Dados de amostra | ✅ |
| `006_proventos.sql` | `proventos` (ENUM `tipo_provento`, coluna gerada `valor_liquido`) | ✅ |

### ENUMs importantes
- `class_ativo`: 13 classes → `ACAO_BR, FII, ETF_BR, BDR, ACAO_EUA, ETF_EUA, REIT, FUNDO, CRIPTO, RENDA_FIXA, POUPANCA, PREVIDENCIA, ALTERNATIVO`
- `tipo_provento`: 7 tipos → `DIVIDENDO, JCP, RENDA_FII, GCAP, CUPOM, AMORTIZACAO, RENDIMENTO`

### Repositórios ativos
| Repositório | Tipo | Uso atual |
|------------|------|-----------|
| `postgresPortfolioRepository.ts` | SQL Pool | Dashboard, posições, carteiras |
| `postgresIngestionService.ts` | SQL Pool | Ingestão de Excel → Postgres |
| `csvPortfolioRepository.ts` | CSV/filesystem | Legado — ainda presente mas não usado como primário |
| `csvClienteRepository.ts` | CSV | Módulo de clientes |
| `csvContaRepository.ts` | CSV | Módulo de contas |

---

## 5. API Routes — Mapa Completo

| Método | Rota | Função | Auth |
|--------|------|--------|------|
| GET | `/api/dashboard-data` | KPIs + alocação | Sim |
| GET | `/api/posicoes` | Listar posições | Sim |
| POST/GET | `/api/proventos` | CRUD proventos | Sim |
| GET/PUT/DELETE | `/api/proventos/[id]` | Item de provento | Sim |
| POST | `/api/upload-positions` | Upload Excel → Postgres (preview + confirmação) | ADMIN/ADVISOR |
| POST | `/api/upload-b3` | Upload CSV B3 antigo | Sim |
| GET/POST | `/api/carteiras` | CRUD carteiras | Sim |
| GET/POST | `/api/ativos` | CRUD ativos | Sim |
| GET/POST | `/api/clientes` | CRUD clientes (CSV) | Sim |
| GET/POST | `/api/contas` | CRUD contas (CSV) | Sim |
| GET | `/api/instituicoes` | Listar instituições | Sim |
| GET | `/api/tipos-investimento` | Tipos de ativo | Sim |
| GET | `/api/analysis` | Análise por classe | Sim |
| GET | `/api/audit-logs` | Logs de auditoria | ADMIN |
| POST | `/api/auth/[...nextauth]` | NextAuth handler | — |

---

## 6. Domínio de Negócio Implementado

### 6.1 Serviços de Portfolio (`portfolioService.ts`)
- `getPortfolioSummary()` — totais, contagens
- `getAllocationByAssetClass()` — alocação por classe (13 classes)
- `getAllocationByInstitution()` — alocação por instituição
- `getTopPositions(n)` — top N posições por valor
- `getConcentrationMetrics()` — HHI, top 1/3/5%
- `getFixedVsVariableRatio()` — Renda Fixa vs Variável
- `getMarkToMarketMetrics(positions, quotes)` — MTM + P/L com BRAPI

### 6.2 Serviços de Análise por Classe
| Serviço | Classes atendidas |
|---------|------------------|
| `fiiAnalysisService.ts` | FII (DY, P/VP, HHI segmento) |
| `fixedIncomeService.ts` | RENDA_FIXA, POUPANCA, PREVIDENCIA |
| `fundAnalysisService.ts` | FUNDO (sharp, beta, concentração) |
| `cryptoAnalysisService.ts` | CRIPTO |
| `diversificationService.ts` | Cross-classe (Sharpe, correlações) |

### 6.3 Regras Tributárias (`impostoService.ts`)
- GCAP ações: isenção R$20k/mês, alíquota 15% swing / 20% day-trade
- GCAP FII: 20% (sem isenção)
- GCAP cripto: 15% base
- JCP: IRRF 15%
- Proventos isentos por classe: DIVIDENDO de ACAO_BR, RENDA_FII de FII
- `calcularIrJcp()`, `calcularGcap()`, `isProventoIsentoIRRF()`

---

## 7. Qualidade de Código

### 7.1 Lint
```
✅ 0 erros
⚠️  18 warnings (estruturais, não eliminables sem refatoração de libs)
```

Warnings remanescentes (intencionais):
| Arquivo | Warning | Motivo |
|---------|---------|--------|
| `DataTable.tsx` | `incompatible-library` (React Compiler) | TanStack Table retorna funções; mitigado com `'use no memo'` |
| `postgresPortfolioRepository.ts` | `QueryResult` não usado | Import legado não removido ainda |
| `csv-reader.ts` | `fs` não usado | Import residual |
| `excelImporter.ts` | 5 imports de path | Constantes herdadas de versão CSV |
| `impostoService.ts` | 2 vars não usadas | Funções exportadas mas não chamadas internamente |

### 7.2 TypeScript
- Modo `strict: true`
- Sem `any` explícito no código fonte (apenas em 1 arquivo de script Node.js externo)
- Discriminated unions para estados async (`status: 'idle' | 'loading' | 'success' | 'error'`)
- `unknown` + type narrowing em todos os `catch`
- `satisfies` usado para validar constantes de labels/colors

### 7.3 Segurança (OWASP Top 10)
- ✅ `requireAuth()` com JWT em todas as rotas sensíveis
- ✅ Roles: ADMIN / ADVISOR / CLIENT com guard por endpoint
- ✅ Input validation com Zod em todos os POST/PUT
- ✅ Sem credenciais hardcoded
- ✅ `bcryptjs` para hash de senhas
- ⚠️ Headers de segurança (CSP, HSTS, X-Frame-Options) **ainda não configurados** no `next.config.ts` (TASK-005 pendente)
- ⚠️ Rate limiting nas rotas de auth **não implementado**

### 7.4 Performance
- `unstable_cache` com revalidação em todas as queries do dashboard (60s para posições, 300s para cotações)
- Server Components para fetching de dados (zero waterfall no client)
- `useTransition` + skeleton na tabela de posições
- `useMemo` para cálculos derivados pesados
- Cotações BRAPI em lotes de 15 tickers com silent fail por lote

---

## 8. Fluxo de Dados Atual

```
Upload Excel
  → POST /api/upload-positions (previewOnly=true)
  → excelImporter.ts → parse + validação
  → retorna preview das 20 primeiras linhas

Confirmação do usuário
  → POST /api/upload-positions (previewOnly=false)
  → postgresIngestionService.persistPositionsToPostgres()
    - upsert carteira default
    - upsert ativo (por ticker ou nome+classe)
    - upsert posição (por carteira+ativo+instituicao+conta)
  → revalida cache next.js

Dashboard
  → app/page.tsx (Server Component)
  → unstable_cache(['portfolio-positions-sql'], 60s)
  → PostgresPortfolioRepository.getAllPositions()
  → portfolioService.ts (alocações, métricas, concentração)
  → getCachedQuotes (BRAPI, 300s) → getMarkToMarketMetrics()
  → PortfolioOverview + AllocationCharts + DistributionCharts + PositionsTable
```

---

## 9. Páginas e UX — Estado atual

| Página | Rota | Status | Observações |
|--------|------|--------|-------------|
| Dashboard | `/` | ✅ Funcional | KPIs, gráficos Recharts, tabela com filtros/paginação |
| Carteira / Posições | `/posicoes` | ✅ Funcional | Tabela com filtros por classe |
| Proventos | `/proventos` | ✅ Funcional | CRUD com modal, cálculo IR automático |
| Importação | `/importacao` | 🔄 Parcial | Página existe, fluxo upload em `/upload` |
| Upload | `/upload` | ✅ Funcional | Fluxo 2 etapas: preview → confirmar |
| Login | `/login` | ✅ Funcional | Credentials + bcrypt |
| Cadastro | `/cadastro` | 🔄 Parcial | Formulários de ativo, carteira, posição |
| Clientes | `/clientes` | 🔄 Parcial | CRUD básico (CSV) |
| Contas | `/contas` | 🔄 Parcial | CRUD básico (CSV) |
| Ativos | `/ativos` | 🔄 Parcial | Listagem + formulário novo |
| Esqueci senha | `/esqueci-senha` | ⚠️ Stub | Sem lógica de e-mail implementada |

---

## 10. Dívida Técnica e Pendências

### 🔴 Alta Prioridade
1. **Headers de segurança** — CSP, HSTS, X-Frame-Options no `next.config.ts` (TASK-005)
2. **Rate limiting** — brute-force nas rotas `/api/auth/*`
3. **`positions/[id]` route** — rota `PATCH/DELETE` para edição de posição individual **não existe** (`app/api/positions/[id]/route.ts` ausente); o `EditPositionModal` tenta chamar esta rota
4. **Sincronização CSV legacy** — `app/api/upload-b3/route.ts` ainda escreve CSV ao invés de Postgres; `googleSheetsImporter` também escreve CSV

### 🟡 Média Prioridade
5. **`QueryResult` import não usado** em `postgresPortfolioRepository.ts` (warning lint)
6. **`csvClienteRepository` / `csvContaRepository`** — módulos de Clientes e Contas ainda em CSV; falta migração para Postgres
7. **Sparklines estáticas** — `PortfolioOverview` usa arrays hardcoded (`[95, 100, 105...]`) em vez de dados históricos reais
8. **`/esqueci-senha`** — não envia e-mail (stub visual apenas)
9. **Rentabilidade Mês** — usa P/L MTM como proxy; não é rentabilidade real do mês
10. **Proventos pendentes e IR devido** — estimados por heurística (0.18% do total); devem vir do banco

### 🟢 Baixa Prioridade
11. **`DOCS_CSVS_FOLDER`** em `csv-reader.ts` — constante declarada e não usada
12. **`fs` import** em `csv-reader.ts` — legado da versão baseada em filesystem
13. **`tmp_import_fixer.js`** na raiz — script temporário não removido
14. **`backlog.md`** desatualizado — data: 2026-03-31, não reflete P1-P5

---

## 11. Próximos Passos Sugeridos

### Passo A — Security hardening (bloqueante para produção)
```ts
// next.config.ts
headers: [{ source: '/(.*)', headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Content-Security-Policy', value: "default-src 'self'..." },
]}]
```

### Passo B — Rota de edição de posição (fix funcional imediato)
Criar `app/api/positions/[id]/route.ts` com `PATCH` e `DELETE` via SQL no `PostgresPortfolioRepository`.

### Passo C — Migrar upload-b3 e Google Sheets para Postgres
Remover escrita de CSV dos handlers; usar `persistPositionsToPostgres`.

### Passo D — Histórico de patrimônio
Criar tabela `historico_patrimonio (data, valor_total_brl)` e popular após cada ingestão, para alimentar Sparklines com dados reais.

### Passo E — Módulo de relatórios consolidado
Transformar `/importacao` em uma página de relatórios real: extrato de proventos, apuração mensal de IR, evolução patrimonial.

---

## 12. Comandos de Desenvolvimento

```bash
# Dev server
npm run dev

# Type check completo
npx tsc --noEmit

# Lint
npm run lint

# Build de produção
npm run build

# Rodar migrations
npm run db:migrate

# Diagnóstico do banco
npm run db:diagnose
```

---

*Documento gerado por revisão automática de código — GerInvest v0.1.0*
