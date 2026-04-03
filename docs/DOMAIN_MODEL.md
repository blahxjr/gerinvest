# Modelo de Domínio — GerInvest

> Entidades, tipos, regras de negócio e cálculos financeiros do domínio de investimentos.

## 🎯 Visão Geral

O domínio do GerInvest representa o **portfólio de investimentos** de um usuário, com foco em:

- Posições individuais (ações, FIIs, renda fixa, etc.)
- Alocações por classe de ativo
- Métricas de performance e concentração
- Validações de negócio

## 📋 Entidades Principais

### Position (Posição)

**Definição:** Representa uma posição individual em um ativo financeiro.

```typescript
export interface Position {
  id: string;                    // Identificador único (UUID)
  ticker: string;                // Símbolo do ativo (VALE3, PETR4, MXRF11)
  assetClass: AssetClass;        // Classificação do ativo
  quantity: number;              // Quantidade de cotas/unidades
  price: number;                 // Preço médio de aquisição
  grossValue: number;            // Valor bruto total (quantity × price)
  institution?: string;          // Instituição financeira
  account?: string;              // Conta específica
  description?: string;          // Descrição opcional
  indexer?: string;              // Indexador (CDI, IPCA, SELIC)
  maturityDate?: string;         // Data de vencimento (YYYY-MM-DD)
  issuer?: string;               // Emissor do ativo
}
```

**Regras de Integridade (Invariants):**

1. **ID único:** Deve ser UUID v4 válido
2. **Ticker válido:** 4-6 caracteres, maiúsculo, alfanumérico
3. **Classe válida:** Deve existir em `AssetClass`
4. **Quantidade positiva:** `quantity > 0`
5. **Preço positivo:** `price > 0`
6. **Valor consistente:** `grossValue ≈ quantity × price` (tolerância: 0.01)
7. **Data válida:** `maturityDate` deve ser futura se presente

**Exemplo Válido:**
```typescript
const position: Position = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  ticker: 'VALE3',
  assetClass: 'ACOES',
  quantity: 100,
  price: 45.50,
  grossValue: 4550.00,
  institution: 'XP Investimentos',
  description: 'Vale S.A.'
};
```

### Portfolio (Portfólio)

**Definição:** Agregado de posições com métricas calculadas.

```typescript
export interface Portfolio {
  positions: Position[];
  summary: PortfolioSummary;
  allocations: AllocationData;
}
```

## 🏷️ Tipos e Enums

### AssetClass

**Definição:** Classificação dos tipos de investimento suportados.

```typescript
export type AssetClass =
  | 'ACOES'              // Ações ordinárias/preferenciais
  | 'BDR'                // Brazilian Depositary Receipts
  | 'ETF'                // Exchange Traded Funds
  | 'FII'                // Fundos de Investimento Imobiliário
  | 'FIAGRO'             // Fundos no Agronegócio
  | 'RENDA_FIXA'         // CDB, LCI, LCA, etc.
  | 'TESOURO_DIRETO'     // Títulos públicos federais
  | 'FUNDOS_MULTIMERCADO' // Fundos multimercado
  | 'PREVIDENCIA'        // Previdência privada
  | 'CRYPTO'             // Criptoativos
  | 'OUTRO';             // Outros investimentos
```

**Labels para UI:**
```typescript
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

**Cores para Gráficos:**
```typescript
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

## 📊 Tipos de Dados Calculados

### PortfolioSummary

```typescript
export interface PortfolioSummary {
  totalInvested: number;      // Soma de grossValue
  totalPositions: number;     // Número de posições ativas
  uniqueTickers: number;      // Tickers distintos
  uniqueAccounts: number;     // Contas distintas
  uniqueInstitutions: number; // Instituições distintas
}
```

### AllocationEntry

```typescript
export interface AllocationEntry {
  assetClass: AssetClass;
  value: number;              // Valor total alocado
  percentage: number;         // % do portfólio total
  count: number;              // Número de posições
}
```

### AllocationData

```typescript
export interface AllocationData {
  byAssetClass: Record<AssetClass, AllocationEntry>;
  byInstitution: Record<string, AllocationEntry>;
}
```

## 🔢 Serviços de Domínio

### PortfolioService

**Responsabilidades:**
- Calcular métricas do portfólio
- Agrupar alocações
- Validar regras de negócio

**Métodos Principais:**

#### getAllocationByAssetClass

```typescript
export function getAllocationByAssetClass(positions: Position[]): Record<AssetClass, AllocationEntry> {
  const totalValue = positions.reduce((sum, pos) => sum + pos.grossValue, 0);

  return positions.reduce((acc, pos) => {
    const { assetClass, grossValue } = pos;

    if (!acc[assetClass]) {
      acc[assetClass] = {
        assetClass,
        value: 0,
        percentage: 0,
        count: 0
      };
    }

    acc[assetClass].value += grossValue;
    acc[assetClass].count += 1;

    return acc;
  }, {} as Record<AssetClass, AllocationEntry>).map(entry => ({
    ...entry,
    percentage: totalValue > 0 ? (entry.value / totalValue) * 100 : 0
  }));
}
```

#### getAllocationByInstitution

```typescript
export function getAllocationByInstitution(positions: Position[]): Record<string, AllocationEntry> {
  // Lógica similar, agrupando por institution
}
```

#### getTopPositions

```typescript
export function getTopPositions(positions: Position[], limit: number = 10): Position[] {
  return positions
    .sort((a, b) => b.grossValue - a.grossValue)
    .slice(0, limit);
}
```

#### getConcentrationMetrics

```typescript
export function getConcentrationMetrics(positions: Position[]) {
  const allocations = getAllocationByAssetClass(positions);
  const highConcentration = Object.values(allocations)
    .filter(entry => entry.percentage > 20)
    .length;

  return {
    diversificationScore: Object.keys(allocations).length,
    highConcentrationCount: highConcentration,
    isWellDiversified: highConcentration === 0
  };
}
```

## 💰 Cálculos Financeiros

### Preço Médio Ponderado

```
PM = Σ (Preço × Quantidade) / Σ Quantidade
```

**Implementação:**
```typescript
export function calculateWeightedAveragePrice(trades: Trade[]): number {
  const totalQuantity = trades.reduce((sum, t) => sum + t.quantity, 0);
  const totalValue = trades.reduce((sum, t) => sum + (t.price * t.quantity), 0);

  return totalQuantity > 0 ? totalValue / totalQuantity : 0;
}
```

### Rentabilidade

```
Rentabilidade = ((Preço Atual - Preço Médio) / Preço Médio) × 100
```

**Implementação:**
```typescript
export function calculateReturn(currentPrice: number, averagePrice: number): number {
  if (averagePrice === 0) return 0;
  return ((currentPrice - averagePrice) / averagePrice) * 100;
}
```

### Alocação Percentual

```
Alocação (%) = (Valor do Ativo / Valor Total do Portfólio) × 100
```

## ✅ Validações e Regras

### Validação de Position

```typescript
export function validatePosition(position: Position): ValidationResult {
  const errors: string[] = [];

  // ID válido
  if (!isValidUUID(position.id)) {
    errors.push('ID deve ser UUID válido');
  }

  // Ticker válido
  if (!/^[A-Z0-9]{4,6}$/.test(position.ticker)) {
    errors.push('Ticker deve ter 4-6 caracteres alfanuméricos maiúsculos');
  }

  // Classe válida
  if (!Object.keys(ASSET_CLASS_LABELS).includes(position.assetClass)) {
    errors.push('Classe de ativo inválida');
  }

  // Valores positivos
  if (position.quantity <= 0) {
    errors.push('Quantidade deve ser positiva');
  }

  if (position.price <= 0) {
    errors.push('Preço deve ser positivo');
  }

  // Valor consistente
  const expectedValue = position.quantity * position.price;
  const tolerance = 0.01;
  if (Math.abs(position.grossValue - expectedValue) > tolerance) {
    errors.push('Valor bruto deve ser quantity × price');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Validação de CSV

```typescript
export function validateCsvRow(row: any): ValidationResult {
  const required = ['ticker', 'assetClass', 'grossValue'];

  for (const field of required) {
    if (!row[field]) {
      return { isValid: false, errors: [`Campo obrigatório ausente: ${field}`] };
    }
  }

  // Validar tipos
  if (typeof row.grossValue !== 'number' || row.grossValue <= 0) {
    return { isValid: false, errors: ['grossValue deve ser número positivo'] };
  }

  return { isValid: true, errors: [] };
}
```

## 🔄 Estados e Transições

### Estados de uma Position

```
Criada → Ativa → Editada → Removida
    ↓       ↓       ↓
  Válida  Válida  Válida
    ↓       ↓       ↓
 Inválida Inválida Inválida
```

### Transições Permitidas

- **Criação:** Apenas se todos os campos obrigatórios válidos
- **Edição:** Atualização de campos não-obrigatórios
- **Remoção:** Sempre permitida (soft delete futuro)

## 📈 Métricas de Qualidade

### Diversificação

- **Score de Diversificação:** Número de classes de ativo com alocação > 5%
- **Concentração Alta:** Qualquer classe com > 20% do portfólio
- **Alerta:** Mais de 2 posições com > 10% cada

### Performance

- **Benchmark:** Comparação com IBOVESPA, CDI, etc.
- **Volatilidade:** Desvio padrão dos retornos
- **Sharpe Ratio:** Retorno ajustado ao risco

## 🔮 Extensões Planejadas

### Suporte a Operações

```typescript
interface Operation {
  id: string;
  positionId: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT';
  quantity: number;
  price: number;
  date: string;
  fees: number;
}
```

### Histórico de Preços

```typescript
interface PriceHistory {
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Rebalanceamento

```typescript
interface RebalancingRule {
  assetClass: AssetClass;
  targetPercentage: number;
  tolerance: number; // ± percentual
}
```

---

*Domain Model v1.0 — Março 2026*