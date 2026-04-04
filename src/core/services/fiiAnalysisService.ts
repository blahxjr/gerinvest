import { Position } from '../domain/position';
import { SubclasseAtivo } from '../domain/types';

/**
 * Resultado da análise de FIIs
 * Alinhado com docs/ai/07-diversification-strategy.md - seção FIIs
 */
export interface FiiAnalysisResult {
  totalValue: number;
  numberOfFiis: number;
  allocationBySubclass: Record<string, { value: number; percentage: number; positionCount: number }>;
  segmentDistribution: Record<string, { value: number; percentage: number }>;
  concentrationMetrics: {
    top1Fii: { name: string; value: number; percentage: number };
    diversificationScore: number;
  };
  recommendations: FiiRecommendation[];
}

export interface FiiRecommendation {
  type: 'DIVERSIFY_SUBCLASS' | 'BALANCE_SEGMENT' | 'REDUCE_CONCENTRATION' | 'CONSIDER_FOF';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Analisar portfólio de FIIs
 */
export function analyzeFiis(positions: Position[]): FiiAnalysisResult {
  // Filtrar apenas FIIs
  const fiis = positions.filter((p) => p.classe === 'FII' || p.assetClass === 'FII');

  if (fiis.length === 0) {
    return {
      totalValue: 0,
      numberOfFiis: 0,
      allocationBySubclass: {},
      segmentDistribution: {},
      concentrationMetrics: {
        top1Fii: { name: '', value: 0, percentage: 0 },
        diversificationScore: 0,
      },
      recommendations: [],
    };
  }

  const totalValue = fiis.reduce((sum, p) => sum + (p.valorAtualBrl || p.grossValue || 0), 0);

  // 1. Alocação por subclasse (TIJOLO, PAPEL, FOF, DESENVOLVIMENTO)
  const allocationBySubclass = calculateFiiAllocationBySubclass(fiis, totalValue);

  // 2. Distribuição por segmento (logístico, laje, shopping, etc.)
  const segmentDistribution = calculateFiiSegmentDistribution(fiis, totalValue);

  // 3. Concentração
  const topFii = fiis.reduce((top, p) => {
    const topValue = top.valorAtualBrl || top.grossValue || 0;
    const pValue = p.valorAtualBrl || p.grossValue || 0;
    return pValue > topValue ? p : top;
  });
  const top1Percentage = totalValue > 0 ? ((topFii.valorAtualBrl || topFii.grossValue || 0) / totalValue) * 100 : 0;
  const diversificationScore = calculateFiiDiversificationScore(fiis, totalValue);

  // 4. Recomendações
  const recommendations = generateFiiRecommendations(allocationBySubclass, top1Percentage, fiis.length, segmentDistribution);

  return {
    totalValue,
    numberOfFiis: fiis.length,
    allocationBySubclass,
    segmentDistribution,
    concentrationMetrics: {
      top1Fii: {
        name: topFii.nome || topFii.ticker || 'Desconhecido',
        value: topFii.valorAtualBrl || topFii.grossValue || 0,
        percentage: top1Percentage,
      },
      diversificationScore,
    },
    recommendations,
  };
}

/**
 * Calcular alocação por subclasse dentro de FIIs
 */
function calculateFiiAllocationBySubclass(
  fiis: Position[],
  totalValue: number
): Record<string, { value: number; percentage: number; positionCount: number }> {
  const subclasses = ['FII_TIJOLO', 'FII_PAPEL', 'FII_FOF', 'FII_DESENVOLVIMENTO'];
  const allocation: Record<string, { value: number; percentage: number; positionCount: number }> = {};

  subclasses.forEach((sc) => {
    allocation[sc] = { value: 0, percentage: 0, positionCount: 0 };
  });

  fiis.forEach((fii) => {
    const subclasse = fii.subclasse || 'FII_PAPEL'; // Default
    const value = fii.valorAtualBrl || fii.grossValue || 0;

    if (allocation[subclasse]) {
      allocation[subclasse].value += value;
      allocation[subclasse].positionCount += 1;
    }
  });

  // Calcular percentuais
  Object.keys(allocation).forEach((sc) => {
    allocation[sc].percentage = totalValue > 0 ? (allocation[sc].value / totalValue) * 100 : 0;
  });

  return allocation;
}

/**
 * Calcular distribuição por segmento (tipificação interna)
 * Nota: Segmentos são inferidos de descrição/ticker
 */
function calculateFiiSegmentDistribution(
  fiis: Position[],
  totalValue: number
): Record<string, { value: number; percentage: number }> {
  const segments: Record<string, number> = {
    logistico: 0,
    varejo: 0,
    corporativo: 0,
    residencial: 0,
    hoteleiro: 0,
    misto: 0,
  };

  fiis.forEach((fii) => {
    const value = fii.valorAtualBrl || fii.grossValue || 0;
    const desc = (fii.descricao || fii.description || fii.nome || '').toLowerCase();
    const ticker = (fii.ticker || '').toUpperCase();

    // Classificação por keywords (simplificado)
    if (desc.includes('logístico') || desc.includes('logistico') || ticker.includes('LOG')) {
      segments.logistico += value;
    } else if (desc.includes('shopping') || desc.includes('varejo') || ticker.includes('SHO')) {
      segments.varejo += value;
    } else if (desc.includes('corporativo') || desc.includes('laje') || ticker.includes('COR')) {
      segments.corporativo += value;
    } else if (desc.includes('residencial') || desc.includes('res')) {
      segments.residencial += value;
    } else if (desc.includes('hotel') || desc.includes('lazer')) {
      segments.hoteleiro += value;
    } else {
      segments.misto += value;
    }
  });

  const result: Record<string, { value: number; percentage: number }> = {};
  Object.entries(segments).forEach(([segment, value]) => {
    result[segment] = {
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });

  return result;
}

/**
 * Calcular score de diversificação de FIIs
 */
function calculateFiiDiversificationScore(fiis: Position[], totalValue: number): number {
  if (fiis.length < 2) return 0;

  // Usar Herfindahl-Hirschman Index
  let hhi = 0;
  fiis.forEach((fii) => {
    const value = fii.valorAtualBrl || fii.grossValue || 0;
    const percentage = totalValue > 0 ? value / totalValue : 0;
    hhi += percentage * percentage;
  });

  // Normalizar: minHhi = 1/n, maxHhi = 1
  const minHhi = 1 / fiis.length;
  const score = ((1 - hhi) / (1 - minHhi)) * 100;

  return Math.max(0, Math.min(100, score));
}

/**
 * Gerar recomendações para carteira de FIIs
 */
function generateFiiRecommendations(
  allocation: Record<string, { value: number; percentage: number; positionCount: number }>,
  top1Percentage: number,
  fiiCount: number,
  segmentDist: Record<string, { value: number; percentage: number }>
): FiiRecommendation[] {
  const recommendations: FiiRecommendation[] = [];

  // Recomendação 1: Diversificar subclasses
  const subclassesWithValue = Object.entries(allocation).filter(([, a]) => a.value > 0).length;
  if (subclassesWithValue < 2) {
    recommendations.push({
      type: 'DIVERSIFY_SUBCLASS',
      message: 'Considere diversificar entre subclasses (TIJOLO, PAPEL, FOF, DESENVOLVIMENTO)',
      impact: 'high',
    });
  }

  // Recomendação 2: Reduzir concentração
  if (top1Percentage > 30) {
    recommendations.push({
      type: 'REDUCE_CONCENTRATION',
      message: `O maior FII representa ${top1Percentage.toFixed(1)}% da alocação em FIIs. Considere reduzir.`,
      impact: 'high',
    });
  }

  // Recomendação 3: Balancear segmentos
  const dominantSegment = Object.entries(segmentDist).reduce(
    (max, [segment, v]) =>
      v.percentage > max.percentage ? { segment, percentage: v.percentage } : max,
    { segment: '', percentage: 0 }
  );
  if (dominantSegment.percentage > 50) {
    recommendations.push({
      type: 'BALANCE_SEGMENT',
      message: `Carteira concentrada em um segmento (${dominantSegment.percentage.toFixed(1)}%). Diversifique entre logística, varejo, corporativo, etc.`,
      impact: 'medium',
    });
  }

  // Recomendação 4: Considerar FOF
  if (!allocation['FII_FOF'] || allocation['FII_FOF'].value === 0) {
    recommendations.push({
      type: 'CONSIDER_FOF',
      message: 'Sem alocação em FOF de FIIs. Pode ser uma forma de diversificação automática.',
      impact: 'low',
    });
  }

  return recommendations;
}
