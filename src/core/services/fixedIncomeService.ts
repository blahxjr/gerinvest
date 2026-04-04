import { Position } from '../domain/position';

/**
 * Resultado da análise de Renda Fixa
 * Alinhado com docs/ai/07-diversification-strategy.md - seção Renda Fixa
 */
export interface FixedIncomeAnalysisResult {
  totalValue: number;
  numberOfPositions: number;
  allocationByIndexer: Record<string, { value: number; percentage: number; positionCount: number }>;
  maturityDistribution: {
    upTo1year: { value: number; percentage: number };
    from1to3years: { value: number; percentage: number };
    from3to5years: { value: number; percentage: number };
    above5years: { value: number; percentage: number };
    undefined: { value: number; percentage: number };
  };
  issuerConcentration: Record<string, { value: number; percentage: number }>;
  fgcCoverage: {
    covered: { value: number; percentage: number };
    notCovered: { value: number; percentage: number };
    unknown: { value: number; percentage: number };
  };
  recommendations: FixedIncomeRecommendation[];
}

export interface FixedIncomeRecommendation {
  type: 'DIVERSIFY_MATURITY' | 'DIVERSIFY_ISSUER' | 'MANAGE_FGC' | 'INCREASE_REAL_RETURN';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Analisar portfólio de Renda Fixa
 */
export function analyzeFixedIncome(positions: Position[]): FixedIncomeAnalysisResult {
  // Filtrar apenas renda fixa
  const rf = positions.filter((p) => p.classe === 'RENDA_FIXA' || p.assetClass === 'RENDA_FIXA');

  if (rf.length === 0) {
    return {
      totalValue: 0,
      numberOfPositions: 0,
      allocationByIndexer: {},
      maturityDistribution: {
        upTo1year: { value: 0, percentage: 0 },
        from1to3years: { value: 0, percentage: 0 },
        from3to5years: { value: 0, percentage: 0 },
        above5years: { value: 0, percentage: 0 },
        undefined: { value: 0, percentage: 0 },
      },
      issuerConcentration: {},
      fgcCoverage: {
        covered: { value: 0, percentage: 0 },
        notCovered: { value: 0, percentage: 0 },
        unknown: { value: 0, percentage: 0 },
      },
      recommendations: [],
    };
  }

  const totalValue = rf.reduce((sum, p) => sum + (p.valorAtualBrl || p.grossValue || 0), 0);

  // 1. Alocação por indexador (PÓS-FIXADO, IPCA, PREFIXADO, TESOURO)
  const allocationByIndexer = calculateFixedIncomeAllocationByIndexer(rf, totalValue);

  // 2. Distribuição de vencimentos
  const maturityDistribution = calculateMaturityDistribution(rf, totalValue);

  // 3. Concentração por emissor
  const issuerConcentration = calculateIssuerConcentration(rf, totalValue);

  // 4. Cobertura FGC
  const fgcCoverage = calculateFgcCoverage(rf, totalValue);

  // 5. Recomendações
  const recommendations = generateFixedIncomeRecommendations(
    allocationByIndexer,
    maturityDistribution,
    issuerConcentration,
    fgcCoverage,
    rf.length
  );

  return {
    totalValue,
    numberOfPositions: rf.length,
    allocationByIndexer,
    maturityDistribution,
    issuerConcentration,
    fgcCoverage,
    recommendations,
  };
}

/**
 * Calcular alocação por indexador
 */
function calculateFixedIncomeAllocationByIndexer(
  positions: Position[],
  totalValue: number
): Record<string, { value: number; percentage: number; positionCount: number }> {
  const indexers = ['POS_FIXADO', 'IPCA', 'PREFIXADO', 'TESOURO'];
  const allocation: Record<string, { value: number; percentage: number; positionCount: number }> = {};

  indexers.forEach((idx) => {
    allocation[idx] = { value: 0, percentage: 0, positionCount: 0 };
  });

  positions.forEach((pos) => {
    const indexer = (pos.benchmark || pos.indexer || 'POS_FIXADO').toUpperCase();
    let normalizedIndexer = 'POS_FIXADO';

    if (indexer.includes('IPCA') || indexer.includes('INFLACAO')) {
      normalizedIndexer = 'IPCA';
    } else if (indexer.includes('TESOURO') || indexer.includes('SELIC') || indexer.includes('PRE')) {
      normalizedIndexer = 'TESOURO';
    } else if (indexer.includes('PREFIXADO') || indexer.includes('PRE')) {
      normalizedIndexer = 'PREFIXADO';
    }

    const value = pos.valorAtualBrl || pos.grossValue || 0;
    allocation[normalizedIndexer].value += value;
    allocation[normalizedIndexer].positionCount += 1;
  });

  // Calcular percentuais
  Object.keys(allocation).forEach((idx) => {
    allocation[idx].percentage = totalValue > 0 ? (allocation[idx].value / totalValue) * 100 : 0;
  });

  return allocation;
}

/**
 * Calcular distribuição de vencimentos
 */
function calculateMaturityDistribution(
  positions: Position[],
  totalValue: number
): FixedIncomeAnalysisResult['maturityDistribution'] {
  const now = new Date();
  let upTo1year = 0;
  let from1to3years = 0;
  let from3to5years = 0;
  let above5years = 0;
  let undefined_ = 0;

  positions.forEach((pos) => {
    const value = pos.valorAtualBrl || pos.grossValue || 0;
    const maturity = pos.dataVencimento || pos.maturityDate;

    if (!maturity) {
      undefined_ += value;
      return;
    }

    const maturityDate = new Date(maturity);
    const diffTime = maturityDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffYears = diffDays / 365.25;

    if (diffYears <= 1) {
      upTo1year += value;
    } else if (diffYears <= 3) {
      from1to3years += value;
    } else if (diffYears <= 5) {
      from3to5years += value;
    } else {
      above5years += value;
    }
  });

  return {
    upTo1year: { value: upTo1year, percentage: totalValue > 0 ? (upTo1year / totalValue) * 100 : 0 },
    from1to3years: { value: from1to3years, percentage: totalValue > 0 ? (from1to3years / totalValue) * 100 : 0 },
    from3to5years: { value: from3to5years, percentage: totalValue > 0 ? (from3to5years / totalValue) * 100 : 0 },
    above5years: { value: above5years, percentage: totalValue > 0 ? (above5years / totalValue) * 100 : 0 },
    undefined: { value: undefined_, percentage: totalValue > 0 ? (undefined_ / totalValue) * 100 : 0 },
  };
}

/**
 * Calcular concentração por emissor
 */
function calculateIssuerConcentration(positions: Position[], totalValue: number): Record<string, { value: number; percentage: number }> {
  const issuers: Record<string, number> = {};

  positions.forEach((pos) => {
    const value = pos.valorAtualBrl || pos.grossValue || 0;
    const issuer = pos.issuer || pos.instituicao || 'DESCONHECIDO';

    if (!issuers[issuer]) {
      issuers[issuer] = 0;
    }
    issuers[issuer] += value;
  });

  const result: Record<string, { value: number; percentage: number }> = {};
  Object.entries(issuers).forEach(([issuer, value]) => {
    result[issuer] = {
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });

  // Ordenar por percentual decrescente
  return Object.entries(result)
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {} as Record<string, { value: number; percentage: number }>);
}

/**
 * Calcular cobertura FGC
 */
function calculateFgcCoverage(positions: Position[], totalValue: number): FixedIncomeAnalysisResult['fgcCoverage'] {
  let covered = 0;
  let notCovered = 0;
  let unknown = 0;

  positions.forEach((pos) => {
    const value = pos.valorAtualBrl || pos.grossValue || 0;
    const desc = (pos.descricao || pos.description || '').toLowerCase();
    const issuer = (pos.issuer || '').toLowerCase();

    // Heurística: FGC cobre bancos brasileiros (não inclui estrangeiros, tesouro)
    if (desc.includes('cdb') || desc.includes('rdb') || desc.includes('fundo garantido')) {
      covered += value;
    } else if (issuer.includes('tesouro') || issuer.includes('federal') || desc.includes('tesouro')) {
      notCovered += value; // Tesouro não tem FGC mas é seguro
    } else if (desc.includes('fgc')) {
      covered += value;
    } else {
      unknown += value;
    }
  });

  return {
    covered: { value: covered, percentage: totalValue > 0 ? (covered / totalValue) * 100 : 0 },
    notCovered: { value: notCovered, percentage: totalValue > 0 ? (notCovered / totalValue) * 100 : 0 },
    unknown: { value: unknown, percentage: totalValue > 0 ? (unknown / totalValue) * 100 : 0 },
  };
}

/**
 * Gerar recomendações para renda fixa
 */
function generateFixedIncomeRecommendations(
  indexers: Record<string, { value: number; percentage: number; positionCount: number }>,
  maturity: FixedIncomeAnalysisResult['maturityDistribution'],
  issuers: Record<string, { value: number; percentage: number }>,
  fgc: FixedIncomeAnalysisResult['fgcCoverage'],
  positionCount: number
): FixedIncomeRecommendation[] {
  const recommendations: FixedIncomeRecommendation[] = [];

  // Recomendação 1: Diversificar vencimentos
  if (maturity.upTo1year.percentage > 50 || maturity.above5years.percentage === 0) {
    recommendations.push({
      type: 'DIVERSIFY_MATURITY',
      message: 'Considere diversificar vencimentos (barbell ou ladder strategy)',
      impact: 'medium',
    });
  }

  // Recomendação 2: Diversificar emissores
  const topIssuer = Object.values(issuers).reduce((max, v) => (v.percentage > max.percentage ? v : max));
  if (topIssuer.percentage > 40) {
    recommendations.push({
      type: 'DIVERSIFY_ISSUER',
      message: `Concentração em emissor: ${topIssuer.percentage.toFixed(1)}%. Diversifique.`,
      impact: 'high',
    });
  }

  // Recomendação 3: Cobertura FGC
  if (fgc.unknown.percentage > 20) {
    recommendations.push({
      type: 'MANAGE_FGC',
      message: `${fgc.unknown.percentage.toFixed(1)}% de cobertura FGC indefinida. Clarifique a segurança dos ativos.`,
      impact: 'medium',
    });
  }

  // Recomendação 4: Retorno real
  if (indexers['PREFIXADO'] && indexers['PREFIXADO'].percentage > 60) {
    recommendations.push({
      type: 'INCREASE_REAL_RETURN',
      message: 'Alto percentual em prefixados. Considere aumentar exposição a IPCA para proteção inflacionária.',
      impact: 'low',
    });
  }

  return recommendations;
}
