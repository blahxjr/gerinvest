import { Position } from '../domain/position';

/**
 * Resultado da análise de Fundos
 * Alinhado com docs/ai/07-diversification-strategy.md - seção Fundos
 */
export interface FundAnalysisResult {
  totalValue: number;
  numberOfFunds: number;
  allocationByCategory: Record<string, { value: number; percentage: number; positionCount: number }>;
  managerConcentration: Record<string, { value: number; percentage: number }>;
  liquidityProfile: {
    daily: { value: number; percentage: number };
    weekly: { value: number; percentage: number };
    monthly: { value: number; percentage: number };
    unknown: { value: number; percentage: number };
  };
  benchmarkCoverage: Record<string, { value: number; percentage: number }>;
  diversificationScore: number;
  recommendations: FundRecommendation[];
}

export interface FundRecommendation {
  type: 'DIVERSIFY_CATEGORIES' | 'REDUCE_MANAGER_CONCENTRATION' | 'REVIEW_LIQUIDITY' | 'CONSOLIDATE_SIMILAR';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Analisar portfólio de Fundos
 */
export function analyzeFunds(positions: Position[]): FundAnalysisResult {
  // Filtrar apenas fundos
  const funds = positions.filter((p) => p.classe === 'FUNDO' || (p.assetClass === 'FUNDO' as any));

  if (funds.length === 0) {
    return {
      totalValue: 0,
      numberOfFunds: 0,
      allocationByCategory: {},
      managerConcentration: {},
      liquidityProfile: {
        daily: { value: 0, percentage: 0 },
        weekly: { value: 0, percentage: 0 },
        monthly: { value: 0, percentage: 0 },
        unknown: { value: 0, percentage: 0 },
      },
      benchmarkCoverage: {},
      diversificationScore: 0,
      recommendations: [],
    };
  }

  const totalValue = funds.reduce((sum, p) => sum + (p.valorAtualBrl || p.grossValue || 0), 0);

  // 1. Alocação por categoria ANBIMA
  const allocationByCategory = calculateFundAllocationByCategory(funds, totalValue);

  // 2. Concentração de gestor
  const managerConcentration = calculateManagerConcentration(funds, totalValue);

  // 3. Perfil de liquidez
  const liquidityProfile = calculateLiquidityProfile(funds, totalValue);

  // 4. Cobertura de benchmark
  const benchmarkCoverage = calculateBenchmarkCoverage(funds, totalValue);

  // 5. Score de diversificação
  const diversificationScore = calculateFundDiversificationScore(funds, totalValue, allocationByCategory);

  // 6. Recomendações
  const recommendations = generateFundRecommendations(
    allocationByCategory,
    managerConcentration,
    liquidityProfile,
    funds.length
  );

  return {
    totalValue,
    numberOfFunds: funds.length,
    allocationByCategory,
    managerConcentration,
    liquidityProfile,
    benchmarkCoverage,
    diversificationScore,
    recommendations,
  };
}

/**
 * Calcular alocação por categoria ANBIMA
 */
function calculateFundAllocationByCategory(
  funds: Position[],
  totalValue: number
): Record<string, { value: number; percentage: number; positionCount: number }> {
  const categories = ['RENDA_FIXA', 'MULTIMERCADO', 'ACOES', 'CAMBIAL', 'FOF'];
  const allocation: Record<string, { value: number; percentage: number; positionCount: number }> = {};

  categories.forEach((cat) => {
    allocation[cat] = { value: 0, percentage: 0, positionCount: 0 };
  });

  funds.forEach((fund) => {
    const subclasse = fund.subclasse || 'MULTIMERCADO';
    let category = 'MULTIMERCADO';

    if (subclasse === 'FUNDO_RENDA_FIXA' || subclasse?.includes('RENDA_FIXA')) {
      category = 'RENDA_FIXA';
    } else if (subclasse === 'FUNDO_ACOES' || subclasse?.includes('ACOES')) {
      category = 'ACOES';
    } else if (subclasse === 'FUNDO_CAMBIAL' || subclasse?.includes('CAMBIAL')) {
      category = 'CAMBIAL';
    } else if (subclasse === 'FUNDO_FOF' || subclasse?.includes('FOF')) {
      category = 'FOF';
    }

    const value = fund.valorAtualBrl || fund.grossValue || 0;
    allocation[category].value += value;
    allocation[category].positionCount += 1;
  });

  // Calcular percentuais
  Object.keys(allocation).forEach((cat) => {
    allocation[cat].percentage = totalValue > 0 ? (allocation[cat].value / totalValue) * 100 : 0;
  });

  return allocation;
}

/**
 * Calcular concentração por gestor
 */
function calculateManagerConcentration(funds: Position[], totalValue: number): Record<string, { value: number; percentage: number }> {
  const managers: Record<string, number> = {};

  funds.forEach((fund) => {
    const value = fund.valorAtualBrl || fund.grossValue || 0;
    // Inferir gestor da instituição ou descrição
    const manager = extractManagerName(fund) || 'DESCONHECIDO';

    if (!managers[manager]) {
      managers[manager] = 0;
    }
    managers[manager] += value;
  });

  const result: Record<string, { value: number; percentage: number }> = {};
  Object.entries(managers).forEach(([manager, value]) => {
    result[manager] = {
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });

  return Object.entries(result)
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {} as Record<string, { value: number; percentage: number }>);
}

/**
 * Extrair nome do gestor de instituição/descrição
 */
function extractManagerName(fund: Position): string {
  const instituicao = (fund.instituicao || '').split(' ')[0];
  const nome = (fund.nome || '').split(' ')[0];

  return instituicao || nome || 'DESCONHECIDO';
}

/**
 * Calcular perfil de liquidez
 */
function calculateLiquidityProfile(
  funds: Position[],
  totalValue: number
): FundAnalysisResult['liquidityProfile'] {
  let daily = 0;
  let weekly = 0;
  let monthly = 0;
  let unknown = 0;

  funds.forEach((fund) => {
    const value = fund.valorAtualBrl || fund.grossValue || 0;
    const desc = (fund.descricao || fund.description || '').toLowerCase();

    if (desc.includes('diário') || desc.includes('daily') || desc.includes('d+1')) {
      daily += value;
    } else if (desc.includes('semanal') || desc.includes('weekly') || desc.includes('d+7')) {
      weekly += value;
    } else if (desc.includes('mensal') || desc.includes('monthly') || desc.includes('d+30')) {
      monthly += value;
    } else {
      unknown += value;
    }
  });

  return {
    daily: { value: daily, percentage: totalValue > 0 ? (daily / totalValue) * 100 : 0 },
    weekly: { value: weekly, percentage: totalValue > 0 ? (weekly / totalValue) * 100 : 0 },
    monthly: { value: monthly, percentage: totalValue > 0 ? (monthly / totalValue) * 100 : 0 },
    unknown: { value: unknown, percentage: totalValue > 0 ? (unknown / totalValue) * 100 : 0 },
  };
}

/**
 * Calcular cobertura de benchmark
 */
function calculateBenchmarkCoverage(funds: Position[], totalValue: number): Record<string, { value: number; percentage: number }> {
  const benchmarks: Record<string, number> = {};

  funds.forEach((fund) => {
    const value = fund.valorAtualBrl || fund.grossValue || 0;
    const benchmark = fund.benchmark || 'SEM_BENCHMARK';

    if (!benchmarks[benchmark]) {
      benchmarks[benchmark] = 0;
    }
    benchmarks[benchmark] += value;
  });

  const result: Record<string, { value: number; percentage: number }> = {};
  Object.entries(benchmarks).forEach(([benchmark, value]) => {
    result[benchmark] = {
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });

  return Object.entries(result)
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {} as Record<string, { value: number; percentage: number }>);
}

/**
 * Calcular score de diversificação de fundos
 */
function calculateFundDiversificationScore(
  funds: Position[],
  totalValue: number,
  allocationByCategory: Record<string, { value: number; percentage: number; positionCount: number }>
): number {
  if (funds.length < 2) return 0;

  // HHI por categoria
  const categoryPercentages = Object.values(allocationByCategory).map((a) => a.percentage / 100);
  let hhi = categoryPercentages.reduce((sum, p) => sum + p * p, 0);

  const minHhi = 1 / Object.keys(allocationByCategory).length;
  const score = ((1 - hhi) / (1 - minHhi)) * 100;

  return Math.max(0, Math.min(100, score));
}

/**
 * Gerar recomendações para fundos
 */
function generateFundRecommendations(
  categories: Record<string, { value: number; percentage: number; positionCount: number }>,
  managers: Record<string, { value: number; percentage: number }>,
  liquidity: FundAnalysisResult['liquidityProfile'],
  fundCount: number
): FundRecommendation[] {
  const recommendations: FundRecommendation[] = [];

  // Recomendação 1: Diversificar categorias
  const categoryCount = Object.values(categories).filter((c) => c.value > 0).length;
  if (categoryCount < 2) {
    recommendations.push({
      type: 'DIVERSIFY_CATEGORIES',
      message: 'Diversifique entre categorias: renda fixa, multimercado, ações, cambial.',
      impact: 'high',
    });
  }

  // Recomendação 2: Reduzir concentração de gestor
  const topManager = Object.values(managers).reduce((max, m) => (m.percentage > max.percentage ? m : max));
  if (topManager.percentage > 50) {
    recommendations.push({
      type: 'REDUCE_MANAGER_CONCENTRATION',
      message: `Gestor dominante: ${topManager.percentage.toFixed(1)}% da alocação. Diversifique.`,
      impact: 'high',
    });
  }

  // Recomendação 3: Revisar liquidez
  if (liquidity.unknown.percentage > 30 || liquidity.monthly.percentage > 50) {
    recommendations.push({
      type: 'REVIEW_LIQUIDITY',
      message: 'Considere aumentar exposição a fundos com liquidez diária.',
      impact: 'medium',
    });
  }

  // Recomendação 4: Consolidar similares
  if (fundCount > 8) {
    recommendations.push({
      type: 'CONSOLIDATE_SIMILAR',
      message: `${fundCount} fundos na carteira. Consolide fundos similares para reduzir custos.`,
      impact: 'medium',
    });
  }

  return recommendations;
}
