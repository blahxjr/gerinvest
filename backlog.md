# PROJINVEST — Backlog de Desenvolvimento

> Atualizado em: 2026-03-31
> MVP atual: dashboard, listagens, importação B3 CSV, PostgreSQL local

---

## Legenda
- `[ ]` Pendente
- `[🔄]` Em progresso
- `[✅]` Concluído
- `[❌]` Cancelado

---

## FASE 1 — Fundação (Prioridade Alta)

### 1.1 Autenticação e Segurança
- [ ] **TASK-001** Instalar NextAuth.js v5 + adapter PostgreSQL
  - Provider Credentials (email + senha com bcrypt)
  - Provider Google OAuth (opcional)
  - Migration: tabelas `users`, `accounts`, `sessions`
- [ ] **TASK-002** Criar `middleware.ts` — proteção de rotas
  - Público: `/login`, `/cadastro`, `/esqueci-senha`
  - Protegido: `/(app)/*`
- [ ] **TASK-003** Criar páginas de autenticação com UI refinada
  - `/login`, `/cadastro`, `/esqueci-senha`
- [ ] **TASK-004** Roles: `ADMIN`, `ADVISOR`, `CLIENT`
  - Coluna `role` na tabela `users`
  - Guard nos endpoints de API
- [ ] **TASK-005** Headers de segurança no `next.config.ts`
  - HSTS, CSP, X-Frame-Options, X-Content-Type-Options
  - Rate limiting: 5 req/min nas rotas de auth

---

### 1.2 Design System e Layout Base
- [ ] **TASK-006** Configurar shadcn/ui + dark theme personalizado
  - Paleta: sky-500 (primary), emerald-500 (accent), slate-900 (bg)
  - Fontes: Bricolage Grotesque (display) + Geist (body) via CDN
- [ ] **TASK-007** Criar componentes de layout
  - `AppSidebar` — navegação lateral, ícones Lucide, collapse em mobile
  - `AppHeader` — breadcrumb, notificações, avatar usuário
  - `AppLayout` — wrapper das páginas autenticadas
- [ ] **TASK-008** Criar componentes de UI customizados
  - `KpiCard` — valor, label, variação %, ícone, seta direcional
  - `DataTable` — TanStack Table v8 (sort, filter, pagination)
  - `PageHeader` — título, subtitle, ações (botões)
  - `EmptyState` — ícone, mensagem, botão de ação
  - `SkeletonCard`, `SkeletonTable` — estados de loading
- [ ] **TASK-009** Animações com Framer Motion
  - `PageTransition` — fade + slide entre rotas
  - `AnimatedNumber` — contador animado para KPIs
  - `StaggerList` — entrada escalonada de listas
- [ ] **TASK-010** Criar `loading.tsx` e `error.tsx` em todas as rotas

---

### 1.3 Banco de Dados — Expansão do Schema
- [ ] **TASK-011** Migration: `001_users.sql` — tabela users (auth)
  ```sql
  id UUID, name, email UNIQUE, password_hash, role, avatar_url,
  created_at, updated_at
  ```
- [ ] **TASK-012** Migration: `002_transacoes.sql`
  ```sql
  id UUID, conta_id, ativo_id, tipo (COMPRA|VENDA|DIVIDENDO|JCP|CUPOM|AMORTIZACAO),
  quantidade, preco_unitario, valor_total, data_liquidacao, corretagem, observacao
  ```
- [ ] **TASK-013** Migration: `003_renda_fixa_detalhes.sql`
  ```sql
  id UUID, ativo_id, data_emissao, data_vencimento, indexador (CDI|IPCA|SELIC|PREFIXADO),
  taxa_juros, taxa_adicional, valor_nominal, aporte_minimo, garantia_fgc BOOLEAN
  ```
- [ ] **TASK-014** Migration: `004_ativos_alternativos.sql`
  - `imoveis` (endereço, área, tipo, valor_venal, renda_mensal)
  - `veiculos` (marca, modelo, ano, placa, valor_fipe, km)
  - `joias_e_outros` (descricao, categoria, valor_estimado, data_avaliacao)
  - `contas_internacionais` (broker, pais, moeda, numero_conta)
- [ ] **TASK-015** Migration: `005_rebalanceamento_configs.sql`
  ```sql
  id UUID, cliente_id, perfil (CONSERVADOR|MODERADO|ARROJADO|AGRESSIVO),
  pct_acoes, pct_fiis, pct_renda_fixa, pct_alternativo, pct_internacional, pct_caixa
  ```

---

## FASE 2 — Módulos de Investimento (Prioridade Alta)

### 2.1 Renda Variável
- [ ] **TASK-016** Página `/investimentos/acoes`
  - Tabela: código, nome, qtd, PM, cotação atual, valor total, lucro/prejuízo, %
  - Ações: Adicionar posição, Registrar transação, Ver histórico
- [ ] **TASK-017** Modal de cadastro de ação
  - Form: código B3, corretora, qtd, preço médio, data | Validação Zod
  - API: `POST /api/investimentos/acoes`
- [ ] **TASK-018** Página `/investimentos/renda-fixa`
  - Tipos: CDB, LCI, LCA, LC, CRI, CRA
  - Indicador visual de vencimento (verde >1 ano, amarelo <6 meses, vermelho <30 dias)
- [ ] **TASK-019** Modal de cadastro de renda fixa
  - Form: tipo, banco, vencimento, indexador, taxa, valor, data aplicação, FGC
- [ ] **TASK-020** Páginas ETFs, FIIs, FIAGROs, BDRs
  - Reutilizar componentes de ações (mesma estrutura)
- [ ] **TASK-021** Página `/investimentos/fundos`
  - Fundos: Ações, Multimercado, RF, Imobiliário; CNPJ, gestor, cotas, valor
- [ ] **TASK-022** Página `/investimentos/debentures`
  - Similar renda fixa com campo série/emissão
- [ ] **TASK-023** Página `/investimentos/ouro-metais`
  - Metais: Ouro, Prata, Platina, Paládio, Cobre
  - Campos: peso (g/oz), pureza, custódia, valor unitário
- [ ] **TASK-024** Páginas de ativos alternativos
  - `/investimentos/imoveis` — listagem com renda mensal e mapa
  - `/investimentos/veiculos` — listagem com depreciação estimada
  - `/investimentos/joias` — galeria + valor estimado
- [ ] **TASK-025** Página `/investimentos/internacional`
  - Contas: Interactive Brokers, Passfolio, Avenue
  - Câmbio USD/BRL manual ou configurável
  - Assets: Stocks, ETFs, REITs

---

## FASE 3 — Dashboard e Carteira Consolidada

- [ ] **TASK-026** Refatorar dashboard com KPIs animados
  - Patrimônio Total (R$), Variação dia/mês/ano, Rentabilidade vs CDI, Nº ativos
- [ ] **TASK-027** Gráfico pizza — Alocação por tipo de ativo (Recharts PieChart)
- [ ] **TASK-028** Gráfico linha — Evolução patrimonial 12 meses + linha CDI
- [ ] **TASK-029** Gráfico Treemap — Peso de cada ativo na carteira
- [ ] **TASK-030** Tabela resumo por corretora
- [ ] **TASK-031** Página `/portfolio` — visão 360° consolidada
  - Filtros: tipo, corretora, período | Export CSV/PDF
  - Cálculo de Preço Médio ponderado, L/P realizado e não realizado

---

## FASE 4 — Diagnóstico e Rebalanceamento

- [ ] **TASK-032** Questionário de Suitability (10 perguntas)
  - Score calculado → perfil atribuído → salvo em banco com data
- [ ] **TASK-033** Engine de diagnóstico
  - Comparar alocação atual vs. ideal por perfil
  - Score de saúde 0-100 + lista de alertas
- [ ] **TASK-034** Sugestão de rebalanceamento
  - Delta por categoria: quanto comprar/vender
  - Simulação interativa
- [ ] **TASK-035** Página `/diagnostico`
  - Gauge de saúde, alertas com severidade, comparativo atual vs. ideal

---

## FASE 5 — Documentos

- [ ] **TASK-036** Template PDF: Suitability (nome, CPF, perfil, respostas, data)
- [ ] **TASK-037** Template PDF: Extrato Consolidado (ativos + gráfico de alocação)
- [ ] **TASK-038** Template PDF: Contrato de Gestão (campos dinâmicos)
- [ ] **TASK-039** Página `/documentos`
  - Listar documentos, gerar, visualizar, baixar, reenviar e-mail
  - Configurar: logo, nome assessor, CNPJ, CVM

---

## FASE 6 — Contas e Importação

- [ ] **TASK-040** Expandir módulo de contas
  - Contas internacionais (moeda, broker, país), CRUD com formulário
- [ ] **TASK-041** Melhorar importação B3
  - Suporte XP, Rico, Clear, BTG; preview antes de confirmar; log de erros
- [ ] **TASK-042** Importação Manual — wizard multi-step
  - Tipo → dados básicos → valores → confirmação

---

## FASE 7 — Configurações e Perfil

- [ ] **TASK-043** Página `/configuracoes`
  - Dados pessoais, alterar senha, notificações, toggle dark/light
- [ ] **TASK-044** Perfil do assessor (logo, CNPJ, CVM) para documentos
- [ ] **TASK-045** Gerenciamento de clientes (ADVISOR/ADMIN)
  - Listar clientes, acessar carteira, atribuir suitability

---

## FASE 8 — Deploy e Produção

- [ ] **TASK-046** Deploy na Vercel + variáveis de ambiente
- [ ] **TASK-047** PostgreSQL produção: Neon.tech ou Supabase
  - Migrar schema, pool `@neondatabase/serverless`
- [ ] **TASK-048** Sentry (erros) + Vercel Analytics (performance)
- [ ] **TASK-049** PWA: `manifest.json`, meta tags dinâmicas, ícone do app

---

## Banco de Dados — Contexto Atual

**Já existe e funciona:**
- `clientes`, `instituicoes`, `contas_corretora`, `tipos_investimento`, `ativos`, `posicoes_diarias`
- View: `resumo_carteira`
- Dado de teste: Junior Ferreira / XP Investimentos / PETR4

**Todas as novas migrations devem ser aditivas (não alterar o schema existente).**

---

*Atualizar este arquivo a cada tarefa iniciada ou concluída.*
