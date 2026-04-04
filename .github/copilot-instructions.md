# ProjInvest — Copilot Instructions

## 🌐 Idioma
**Sempre responda em Português do Brasil (pt-BR).** Isso se aplica a todas as mensagens de chat, comentários de código, mensagens de commit, documentação, nomes de variáveis descritivas, textos de UI e qualquer outra saída de texto gerada pelo agente.

---

## Visão Geral do Projeto
**ProjInvest** é uma aplicação Next.js 14+ (App Router, TypeScript estrito) para gerenciamento e visualização de carteira de investimentos brasileira, com suporte a CSVs importados manualmente. O stack é: Next.js 14, TypeScript, TailwindCSS v3, Recharts, csv-parse, e Neon/PostgreSQL como banco futuro.

Arquitetura em camadas:
- `src/core/domain/` → Tipos, entidades e interfaces puras
- `src/core/services/` → Serviços de domínio (sem side-effects de I/O)
- `src/infra/` → Implementações concretas (CSV, DB, HTTP)
- `src/ui/components/` → Componentes React puros (sem lógica de negócio)
- `app/` → Pages e API Routes do Next.js App Router

---

## 1. CORREÇÕES CRÍTICAS DE BACKEND

### 1.1 Corrigir `normalizeCurrency` em `src/infra/csv/helpers.ts`
Reescrever a função para suportar múltiplos formatos sem assumir escala:
```ts
export function normalizeCurrency(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  
  let str = String(value).trim();
  // Remove símbolo R$, espaços e caracteres não numéricos exceto vírgula e ponto
  str = str.replace(/[R$\s]/g, '');
  
  // Detecta formato brasileiro: 1.234,56 → ponto como milhar, vírgula como decimal
  const brFormat = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(str);
  if (brFormat) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // Formato americano: 1,234.56 → vírgula como milhar, ponto como decimal
    str = str.replace(/,/g, '');
  }
  
  const parsed = parseFloat(str);
  return Number.isFinite(parsed) ? parsed : 0;
}
```

### 1.2 Adicionar validação de colunas obrigatórias no `csv-reader.ts`
```ts
const REQUIRED_COLUMNS = ['ticker', 'assetClass', 'grossValue'];

export async function readCsv<T>(filePath: string, mapper: (row: any) => T): Promise<{ data: T[]; errors: string[] }> {
  try { await fs.access(filePath); } catch { return { data: [], errors: ['Arquivo não encontrado'] }; }
  
  const content = await fs.readFile(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
  
  if (records.length === 0) return { data: [], errors: ['CSV vazio'] };
  
  const headers = Object.keys(records);
  const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  if (missing.length > 0) {
    return { data: [], errors: [`Colunas obrigatórias ausentes: ${missing.join(', ')}`] };
  }
  
  const errors: string[] = [];
  const data = records.map((row: any, i: number) => {
    try { return mapper(row); }
    catch (e) { errors.push(`Linha ${i + 2}: ${String(e)}`); return null; }
  }).filter(Boolean) as T[];
  
  return { data, errors };
}
```

### 1.3 Expandir `AssetClass` em `src/core/domain/types.ts`
```ts
export type AssetClass =
  | 'ACOES'
  | 'BDR'
  | 'ETF'
  | 'FII'
  | 'FIAGRO'
  | 'RENDA_FIXA'
  | 'TESOURO_DIRETO'
  | 'FUNDOS_MULTIMERCADO'
  | 'PREVIDENCIA'
  | 'CRYPTO'
  | 'OUTRO';

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  ACOES: 'Ações',
  BDR: 'BDR',
  ETF: 'ETF',
  FII: 'FII',
  FIAGRO: 'Fiagro',
  RENDA_FIXA: 'Renda Fixa',
  TESOURO_DIRETO: 'Tesouro Direto',
  FUNDOS_MULTIMERCADO: 'Fundos Multimercado',
  PREVIDENCIA: 'Previdência',
  CRYPTO: 'Criptoativos',
  OUTRO: 'Outros',
};
```

### 1.4 Criar API Route para edição manual de posições
Criar `app/api/positions/[id]/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { CsvPortfolioRepository } from '@/infra/repositories/csvPortfolioRepository';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const repo = new CsvPortfolioRepository();
  
  try {
    const updated = await repo.updatePosition(params.id, body);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const repo = new CsvPortfolioRepository();
  await repo.deletePosition(params.id);
  return NextResponse.json({ ok: true });
}
```

### 1.5 Implementar `updatePosition` e `deletePosition` em `CsvPortfolioRepository`
O repositório deve ler todas as posições, modificar o registro pelo `id`, e reescrever o CSV com `csv-writer`. Use o `csv-writer.ts` já existente.

### 1.6 Adicionar cache no Server Component da dashboard
No `app/page.tsx`, envolver o carregamento de dados com `unstable_cache` do Next.js:
```ts
import { unstable_cache } from 'next/cache';

const getCachedPositions = unstable_cache(
  async () => {
    const repo = new CsvPortfolioRepository();
    return repo.getAllPositions().catch(() => []);
  },
  ['portfolio-positions'],
  { revalidate: 60 } // revalida a cada 60s
);
```

---

## 2. CORREÇÕES E IMPLEMENTAÇÕES DE FRONTEND

### 2.1 Instalar e integrar Recharts para gráficos reais
```bash
npm install recharts
npm install --save-dev @types/recharts
```

### 2.2 Reescrever `AllocationCharts.tsx` com gráficos interativos
Substituir as barras HTML por gráficos Recharts. O componente deve ser um **Client Component** (`'use client'`) com:

- **PieChart/DonutChart** para alocação por classe de ativo (com animação `AnimationEasing`)
- **BarChart horizontal** para alocação por instituição
- **Tooltip customizado** mostrando: Nome, Valor em R$, % da carteira
- **Legenda clicável** que filtra/destaca fatias
- **ResponsiveContainer** para adaptar ao tamanho da tela
- **Cores por classe de ativo** definidas em constante:
  ```ts
  export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
    ACOES: '#3b82f6',        // blue-500
    BDR: '#8b5cf6',          // violet-500
    ETF: '#06b6d4',          // cyan-500
    FII: '#10b981',          // emerald-500
    FIAGRO: '#84cc16',       // lime-500
    RENDA_FIXA: '#f59e0b',   // amber-500
    TESOURO_DIRETO: '#f97316', // orange-500
    FUNDOS_MULTIMERCADO: '#ec4899', // pink-500
    PREVIDENCIA: '#6366f1',  // indigo-500
    CRYPTO: '#14b8a6',       // teal-500
    OUTRO: '#94a3b8',        // slate-400
  };
  ```

### 2.3 Implementar gráficos adicionais na dashboard
Adicionar um terceiro painel de gráficos com:
- **LineChart** de evolução histórica do patrimônio (se houver múltiplos CSVs com datas diferentes)
- **BarChart** de top 10 posições por valor
- **DonutChart** de Renda Fixa vs Renda Variável com valor em R$ no centro

### 2.4 Adicionar botão "Editar" na `PositionsTable.tsx`
```tsx
'use client';
import { useState } from 'react';
import EditPositionModal from './EditPositionModal';

// Na coluna de ações da tabela:
<button
  onClick={() => setEditingPosition(position)}
  className="text-sky-400 hover:text-sky-200 transition-colors p-1 rounded"
  aria-label={`Editar posição ${position.ticker}`}
>
  <PencilIcon className="w-4 h-4" />
</button>
```

### 2.5 Criar `EditPositionModal.tsx`
Modal para edição manual com campos:
- `ticker` (texto, obrigatório)
- `description` (texto)
- `assetClass` (select com todas as opções de `AssetClass`)
- `institution` (texto)
- `account` (texto)
- `quantity` (número)
- `price` (número, formato BRL)
- `grossValue` (número calculado automaticamente como `quantity × price`, editável manualmente)
- `indexer` (texto opcional, para renda fixa)
- `maturityDate` (date opcional, para renda fixa)
- `issuer` (texto opcional)

O modal deve:
1. Fazer `PATCH /api/positions/[id]` ao salvar
2. Usar `router.refresh()` do Next.js para recarregar os dados da page
3. Ter validação inline com mensagens de erro
4. Fechar com `Escape` e click fora

### 2.6 Adicionar paginação e filtros na `PositionsTable.tsx`
- Filtro por `assetClass` (multiselect)
- Filtro por `institution` (multiselect)
- Busca por `ticker` ou `description` (input text com debounce 300ms)
- Ordenação clicável em todas as colunas (asc/desc)
- Paginação de 25 itens por página com `Previous / Next`
- Exibir contador: "Mostrando 1–25 de 142 posições"

### 2.7 Adicionar KPIs adicionais em `PortfolioOverview.tsx`
Além dos KPIs existentes, adicionar:
- **Rentabilidade estimada** (se o CSV tiver campos `purchasePrice` ou `averageCost`)
- **Diversificação** (número de classes com alocação > 5%)
- **Maior posição** (ticker + % do portfólio)
- **Data da última importação** formatada em pt-BR: `dd/MM/yyyy HH:mm`
- **Badge de alerta** se alguma posição única representar > 20% do portfólio (concentração alta)

### 2.8 Criar `app/loading.tsx` e `app/error.tsx`
```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Skeleton para KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
        {/* Skeleton para gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
```

```tsx
// app/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-red-400">Erro ao carregar dashboard</h2>
        <p className="text-slate-400">{error.message}</p>
        <button onClick={reset} className="bg-sky-600 text-white px-4 py-2 rounded-lg">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
```

---

## 3. PÁGINA DE IMPORTAÇÃO — MELHORIAS

### 3.1 Validação visual no upload
A página `app/importacao` deve exibir:
- Preview das primeiras 5 linhas do CSV antes de confirmar importação
- Lista de erros de validação com número da linha problemática
- Confirmação com resumo: "X posições válidas, Y erros encontrados"
- Opção "Substituir tudo" vs "Mesclar com existente"

### 3.2 Mapeamento flexível de colunas
Exibir um mapper visual onde o usuário pode associar colunas do CSV importado aos campos internos do sistema, para suportar CSVs de diferentes corretoras (XP, Rico, Clear, NuInvest, Inter etc.).

---

## 4. REGRAS GERAIS DE CODIFICAÇÃO

### TypeScript
- Nunca usar `any` explícito; usar `unknown` e fazer type narrowing
- Sempre tipar o retorno de funções assíncronas: `Promise<T>`
- Usar `satisfies` do TypeScript 4.9+ para validar objetos contra tipos
- Preferir tipos discriminados para estados de loading/error/success:
  ```ts
  type AsyncState<T> = 
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; message: string };
  ```

### React / Next.js
- Server Components para fetching de dados; Client Components apenas para interatividade
- Nunca usar `useEffect` para fetching — usar Server Components ou SWR/React Query
- Usar `router.refresh()` após mutações em vez de recarregar a página
- Adicionar `Suspense` boundaries em torno de componentes que fazem fetch

### Formatação de valores financeiros
Sempre usar esta função para exibir valores monetários:
```ts
export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPercent = (value: number, decimals = 2) =>
  `${value.toFixed(decimals)}%`;
```

### Acessibilidade
- Todos os botões de ação devem ter `aria-label` descritivo
- Tabelas devem usar `<thead>`, `<th scope="col">`, e `<caption>` ou `aria-label`
- Modais devem capturar foco (`focus-trap`) e fechar com `Escape`
- Cores de estado (verde/vermelho para lucro/perda) nunca devem ser o único indicador — usar ícone ou texto junto

---

## 5. ESTRUTURA DE ARQUIVOS ESPERADA PÓS-REFATORAÇÃO
## 5. ESTRUTURA DE ARQUIVOS ESPERADA PÓS-REFATORAÇÃO
src/
├── core/
│ ├── domain/
│ │ ├── types.ts ← AssetClass expandido + ASSET_CLASS_LABELS + ASSET_CLASS_COLORS
│ │ ├── position.ts ← Position type
│ │ ├── portfolio.ts ← PortfolioSummary, AllocationEntry
│ │ └── validation.ts ← validatePosition(), validateCsvRow()
│ └── services/
│ └── portfolioService.ts
├── infra/
│ ├── csv/
│ │ ├── csv-reader.ts ← Com validação de colunas obrigatórias e retorno de erros
│ │ ├── csv-writer.ts ← Para persistir edições manuais
│ │ ├── helpers.ts ← normalizeCurrency corrigido
│ │ └── excelImporter.ts
│ └── repositories/
│ ├── portfolioRepository.ts ← Interface com updatePosition + deletePosition
│ └── csvPortfolioRepository.ts
└── ui/
└── components/
├── dashboard/
│ ├── PortfolioOverview.tsx ← KPIs expandidos
│ ├── AllocationCharts.tsx ← Recharts PieChart + BarChart (Client)
│ ├── DistributionCharts.tsx ← DonutChart RF vs RV + Top 10 BarChart (Client)
│ ├── PositionsTable.tsx ← Com filtros, ordenação, paginação, botão Editar
│ └── EditPositionModal.tsx ← Modal de edição manual (Client)
└── upload/
├── CsvUploader.tsx
├── CsvPreview.tsx ← Preview das primeiras linhas
└── ColumnMapper.tsx ← Mapeamento visual de colunas

app/
├── page.tsx ← Server Component com unstable_cache
├── loading.tsx ← Skeleton loader
├── error.tsx ← Error boundary
├── layout.tsx
└── api/
├── positions/
│ └── [id]/
│ └── route.ts ← PATCH + DELETE
└── import/
└── route.ts ← POST para upload de CSV

text

---

## 6. FLUXO DE DADOS CORRETO
CSV Upload → app/api/import/route.ts
→ excelImporter.ts (parse + validação)
→ csv-writer.ts (persiste em public/data/portfolio-positions.csv)
→ revalidateTag('portfolio-positions') (invalida cache)

Dashboard → app/page.tsx (Server Component)
→ unstable_cache('portfolio-positions')
→ CsvPortfolioRepository.getAllPositions()
→ csv-reader.ts (lê e valida CSV)
→ portfolioService.ts (calcula alocações, métricas)
→ PortfolioOverview + AllocationCharts + PositionsTable

Edição → PositionsTable → botão Editar → EditPositionModal
→ PATCH /api/positions/[id]
→ CsvPortfolioRepository.updatePosition()
→ csv-writer.ts (reescreve CSV com posição atualizada)
→ router.refresh() no Client Component

text

---

## 7. COMANDOS DE DESENVOLVIMENTO

```bash
# Instalar dependências necessárias
npm install recharts
npm install --save-dev @types/recharts

# Executar em desenvolvimento
npm run dev

# Typecheck completo
npx tsc --noEmit

# Lint
npm run lint

# Build de produção (verificar se sem erros antes de PR)
npm run build
```

---

## 8. TESTES MÍNIMOS ESPERADOS

Para cada feature implementada, criar testes em `__tests__/`:
- `helpers.test.ts` → testar `normalizeCurrency` com casos: `"1.234,56"`, `"1234.56"`, `"R$ 1.000,00"`, `"150"`, `""`, `null`
- `csvPortfolioRepository.test.ts` → mock de `fs`, testar fallback, testar CSV inválido
- `portfolioService.test.ts` → testar `getAllocationByAssetClass`, `getConcentrationMetrics`

---

*Este arquivo é a fonte de verdade para o GitHub Copilot ao trabalhar neste projeto. Todas as sugestões devem seguir a arquitetura, convenções de nomes e padrões aqui descritos.*