# PROJINVEST — Instruções para GitHub Copilot

## Contexto do Projeto

PROJINVEST é um sistema web de gestão de investimentos pessoais e patrimoniais, voltado para o mercado brasileiro e internacional. O objetivo é escriturar todos os tipos de investimento de uma pessoa, oferecer diagnósticos, sugerir distribuição e rebalanceamento de carteiras, e gerar documentos personalizáveis (suitability, contratos).

---

## Stack Tecnológica

- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Banco de Dados**: PostgreSQL (pg / Drizzle ORM)
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Autenticação**: NextAuth.js v5 (Auth.js) com providers: Credentials, Google
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod
- **Geração de Documentos**: @react-pdf/renderer
- **Tabelas**: TanStack Table v8
- **Estado global**: Zustand
- **Deploy**: Vercel
- **Variáveis de ambiente**: `.env.local` (nunca commitar)

---

## Arquitetura

```
projinvest-web/
├── app/
│   ├── (auth)/                 # login, cadastro, recuperação
│   ├── (app)/                  # rotas protegidas (autenticadas)
│   │   ├── dashboard/
│   │   ├── portfolio/
│   │   ├── investimentos/
│   │   │   ├── acoes/
│   │   │   ├── renda-fixa/
│   │   │   ├── cdb/
│   │   │   ├── fundos/
│   │   │   ├── debentures/
│   │   │   ├── etfs/
│   │   │   ├── ouro-metais/
│   │   │   ├── imoveis/
│   │   │   ├── veiculos/
│   │   │   └── joias/
│   │   ├── contas/
│   │   ├── diagnostico/
│   │   ├── rebalanceamento/
│   │   ├── documentos/
│   │   ├── importacao/
│   │   └── configuracoes/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui base
│   ├── charts/                 # Recharts wrappers
│   ├── forms/                  # Formulários por domínio
│   ├── tables/                 # TanStack Table wrappers
│   └── layout/                 # Header, Sidebar, Footer
├── lib/
│   ├── db.ts                   # Pool PostgreSQL
│   ├── auth.ts                 # NextAuth config
│   ├── validations/            # Schemas Zod
│   └── utils/
├── hooks/                      # Custom hooks React
├── stores/                     # Zustand stores
├── types/                      # TypeScript types globais
├── migrations/                 # SQL migrations
├── docs/progresso.md
└── backlog.md
```

---

## Identidade Visual

### Paleta de Cores (Finance Dark Theme)
```css
--primary:        #0EA5E9   /* sky-500 — azul financeiro */
--primary-dark:   #0284C7   /* sky-600 */
--accent:         #10B981   /* emerald-500 — crescimento/lucro */
--danger:         #EF4444   /* red-500 — prejuízo */
--warning:        #F59E0B   /* amber-500 — atenção */
--surface:        #0F172A   /* slate-900 — fundo escuro */
--surface-2:      #1E293B   /* slate-800 — cards */
--surface-3:      #334155   /* slate-700 — elementos */
--text:           #F1F5F9   /* slate-100 */
--text-muted:     #94A3B8   /* slate-400 */
```

### Fontes
- **Display**: `Bricolage Grotesque` — títulos, KPIs grandes
- **Body**: `Geist` ou `Inter` — texto corrido, tabelas, labels
- Variáveis CSS: `--font-display` e `--font-body`

### Tom de Design
- Dark mode como padrão; light mode opcional com toggle
- Inspiração: Linear, Vercel Dashboard, Firi Finance, Robinhood
- Cards com `backdrop-blur` e bordas sutis (`border border-white/5`)
- Animações de entrada com Framer Motion (`opacity + translateY`)
- Números financeiros: `tabular-nums` + `Intl.NumberFormat('pt-BR')`
- KPIs com variação percentual e seta direcional (▲ emerald / ▼ red)

---

## Tipos de Investimento Suportados

| Categoria | Tipos | Fonte |
|---|---|---|
| Renda Variável | Ações BR/EUA, BDRs, ETFs, FIIs, FIAGROs | B3 CSV / API |
| Renda Fixa | CDB, LCI, LCA, LC, CRI, CRA | Manual |
| Renda Fixa | Tesouro Direto, Debêntures, Fundos RF | Manual |
| Fundos | Ações, Multimercado, Imobiliário, RF | Manual |
| Metais | Ouro, Prata, Platina, Paládio, Cobre | Manual |
| Alternativos | Imóveis, Veículos, Joias, Arte | Manual |
| Internacional | Stocks EUA, ETFs, REITs, Bonds | Manual |

---

## Funcionalidades Principais

### 1. Escrituração de Investimentos
- CRUD completo para cada tipo de investimento
- Importação via CSV (B3, Inter, XP, BTG, Rico)
- Vinculação a contas em bancos/corretoras BR e internacionais
- Histórico de transações (compra, venda, dividendo, JCP, cupom, etc.)

### 2. Carteira Consolidada (`/portfolio`)
- Visão geral de todos os ativos unificados
- Groupby: tipo, corretora, moeda
- Valor em R$ e USD com câmbio configurável
- % de alocação por categoria
- Gráficos: pizza, treemap, linha de evolução patrimonial

### 3. Diagnóstico e Rebalanceamento
- Questionário suitability (Conservador, Moderado, Arrojado, Agressivo)
- Comparativo alocação atual vs. ideal por perfil
- Cálculo delta: quanto comprar/vender por categoria
- Alertas: concentração excessiva, vencimento próximo, cotação abaixo do PM

### 4. Geração de Documentos (`/documentos`)
- Suitability em PDF com dados do cliente e perfil
- Extrato consolidado da carteira
- Contrato de gestão com campos dinâmicos
- Parâmetros configuráveis: logo, nome assessor, CNPJ, CVM

### 5. Autenticação e Segurança
- Login email/senha (bcrypt) + Google OAuth
- JWT + NextAuth sessions
- Roles: ADMIN, ADVISOR, CLIENT
- Row-level security: cada usuário acessa apenas seus dados
- Rate limiting nas APIs de auth
- Headers de segurança (HSTS, CSP, X-Frame-Options)

---

## Padrões de Código

### TypeScript
- Strict mode ativado (`strict: true` no tsconfig)
- Interfaces para todos os tipos de domínio em `/types`
- `never` para exhaustive switch cases
- Evitar `any`; usar `unknown` quando necessário

### Componentes React
- Server Components por padrão; `'use client'` apenas para interatividade
- Props tipadas com interface explícita
- Memoização (`useMemo`, `useCallback`) somente quando necessário

### API Routes
- REST pattern: `GET /api/investimentos/acoes`, `POST /api/investimentos/acoes`
- Retorno padrão: `{ data, error, meta }`
- Validação de input com Zod em TODAS as rotas
- Try/catch em todas as chamadas ao banco
- HTTP status codes corretos (200, 201, 400, 401, 403, 404, 500)

### Banco de Dados
- Migrations em `/migrations/` (SQL puro numerados: `001_users.sql`)
- Índices em todas as FKs e colunas de busca frequente
- UUIDs para IDs de negócio
- `created_at`, `updated_at` em todas as tabelas
- Soft delete com `deleted_at` onde aplicável

### Estilização
- Tailwind classes; sem inline styles
- Variantes de estado com `data-*` attributes ou `cn()` do shadcn
- Mobile-first: breakpoints `sm: md: lg: xl:`
- Nunca usar cores hardcoded; sempre tokens CSS ou classes Tailwind

---

## Formatação de Valores Financeiros

```typescript
// Moeda BRL
export const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// Moeda USD
export const formatUSD = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

// Percentual
export const formatPct = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(v / 100);

// Quantidade (até 8 casas decimais para crypto/metais)
export const formatQty = (v: number, decimals = 2) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: 8 }).format(v);
```

---

## Regras de Desenvolvimento

1. **Backlog obrigatório**: Antes de implementar, consulte e atualize `backlog.md`
2. **Commits semânticos**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
3. **Nunca commitar**: `.env.local`, segredos, `node_modules`
4. **Testes**: Ao menos testes de unidade para lógica de negócio (PM, rebalanceamento)
5. **Acessibilidade**: ARIA labels, contraste WCAG AA, keyboard navigation
6. **Loading states**: `loading.tsx` e `<Suspense>` com skeleton em TODAS as rotas com dados
7. **Erros**: `error.tsx` e `not-found.tsx` em todas as rotas dinâmicas
8. **Contexto pequeno**: Criar tarefas pequenas no backlog para evitar contextos grandes

---

## Schema Existente no Banco

```sql
-- JÁ IMPLEMENTADO (não alterar sem migration):
clientes (id UUID, nome, documento, email, created_at)
instituicoes (id UUID, nome, cnpj, tipo, created_at)
contas_corretora (id UUID, cliente_id, instituicao_id, numero_conta, apelido)
tipos_investimento (id SERIAL, nome, descricao)
ativos (id UUID, codigo_negociacao, nome_produto, tipo_papel, tipo_investimento_id, emissor)
posicoes_diarias (id UUID, conta_id, ativo_id, data_referencia, quantidade, preco_fechamento, valor_liquido, hash_linha)
View: resumo_carteira
```

---

## Ambiente

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/projinvest
NEXTAUTH_SECRET=<gerar: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<opcional>
GOOGLE_CLIENT_SECRET=<opcional>
```

```bash
npm run dev          # Desenvolvimento localhost:3000
npm run build        # Build produção
npm run lint         # ESLint
npm run db:migrate   # Executar migrations SQL
```

*Leia estas instruções antes de cada tarefa. Sempre consulte e atualize o `backlog.md`.*
