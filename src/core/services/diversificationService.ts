import { Position } from '../domain/position';
import { ClasseAtivo } from '../domain/types';

/**
 * Resultado de análise de diversificação
 * Alinhado com docs/ai/07-diversification-strategy.md
 */
export interface DiversificationResult {
  totalValue: number;
  numberOfPosition: number;
  allocationByClass: Record<ClasseAtivo, { value: number; percentage: number }>;
  concentrationMetrics: ConcentrationMetrics;
  currencyExposure: CurrencyExposure;
  diversificationScore: number; // 0-100
  alerts: Alert[];
}

export interface ConcentrationMetrics {
  top1Value: number;
  top1Percentage: number;
  top3Value: number;
  top3Percentage: number;
  top5Value: number;
  top5Percentage: number;
  byClass: Record<ClasseAtivo, { value: number; percentage: number }>;
}

export interface CurrencyExposure {
  BRL: { value: number; percentage: number };
  USD: { value: number; percentage: number };
  EUR: { value: number; percentage: number };
  other: { value: number; percentage: number };
}

export interface Alert {
  type: 'HIGH_CONCENTRATION_ASSET' | 'HIGH_CONCENTRATION_CLASS' | 'UNBALANCED_CURRENCY' | 'LOW_DIVERSIFICATION';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value?: number;
  percentage?: number;
}

/**
 * Analisar diversificação geral da carteira
 */
export function analyzeDiversification(positions: Position[]): DiversificationResult {
  if (positions.length === 0) {
    return {
      totalValue: 0,
      numberOfPosition: 0,
      allocationByClass: {} as Record<ClasseAtivo, { value: number; percentage: number }>,
      concentrationMetrics: {
        top1Value: 0,
        top1Percentage: 0,
        top3Value: 0,
        top3Percentage: 0,
        top5Value: 0,
        top5Percentage: 0,
        byClass: {} as Record<ClasseAtivo, { value: number; percentage: number }>,
      },
      currencyExposure: { BRL: { value: 0, percentage: 0 }, USD: { value: 0, percentage: 0 }, EUR: { value: 0, percentage: 0 }, other: { value: 0, percentage: 0 } },
      diversificationScore: 0,
      alerts: [],
    };
  }

  const totalValue = positions.reduce((sum, p) => sum + (p.valorAtualBrl || p.grossValue || 0), 0);

  // 1. Alocação por classe
  const allocationByClass = calculateAllocationByClass(positions, totalValue);

  // 2. Concentração
  const concentrationMetrics = calculateConcentration(positions, allocationByClass, totalValue);

  // 3. Exposição cambial
  const currencyExposure = calculateCurrencyExposure(positions, totalValue);

  // 4. Score de diversificação
  const diversificationScore = calculateDiversificationScore(positions, allocationByClass);

  // 5. Alertas
  const alerts = generateAlerts(concentrationMetrics, currencyExposure, positions.length, allocationByClass);

  return {
    totalValue,
    numberOfPosition: positions.length,
    allocationByClass,
    concentrationMetrics,
    currencyExposure,
    diversificationScore,
    alerts,
  };
}

/**
 * Calcular alocação por classe
 */
function calculateAllocationByClass(
  positions: Position[],
  totalValue: number
): Record<ClasseAtivo, { value: number; percentage: number }> {
  const allocation = {} as Record<ClasseAtivo, { value: number; percentage: number }>;

  positions.forEach((pos) => {
    const classe = pos.classe || (pos.assetClass as ClasseAtivo) || 'ALTERNATIVO';
    const value = pos.valorAtualBrl || pos.grossValue || 0;

    if (!allocation[classe]) {
      allocation[classe] = { value: 0, percentage: 0 };
    }
    allocation[classe].value += value;
  });

  // Calcular percentuais
  Object.keys(allocation).forEach((classe) => {
    allocation[classe as ClasseAtivo].percentage = totalValue > 0 ? (allocation[classe as ClasseAtivo].value / totalValue) * 100 : 0;
  });

  return allocation;
}

/**
 * Calcular concentração (top 1, 3, 5)
 */
function calculateConcentration(
  positions: Position[],
  allocationByClass: Record<ClasseAtivo, { value: number; percentage: number }>,
  totalValue: number
): ConcentrationMetrics {
  // Ordenar posições por valor decrescente
  const sortedByValue = [...positions].sort((a, b) => {
    const aValue = a.valorAtualBrl || a.grossValue || 0;
    const bValue = b.valorAtualBrl || b.grossValue || 0;
    return bValue - aValue;
  });

  const top1Value = sortedByValue[0]?.valorAtualBrl || sortedByValue[0]?.grossValue || 0;
  const top3Value = sortedByValue.slice(0, 3).reduce((sum, p) => sum + (p.valorAtualBrl || p.grossValue || 0), 0);
  const top5Value = sortedByValue.slice(0, 5).reduce((sum, p) => sum + (p.valorAtualBrl || p.grossValue || 0), 0);

  return {
    top1Value,
    top1Percentage: totalValue > 0 ? (top1Value / totalValue) * 100 : 0,
    top3Value,
    top3Percentage: totalValue > 0 ? (top3Value / totalValue) * 100 : 0,
    top5Value,
    top5Percentage: totalValue > 0 ? (top5Value / totalValue) * 100 : 0,
    byClass: allocationByClass,
  };
}

/**
 * Calcular exposição cambial
 */
function calculateCurrencyExposure(positions: Position[], totalValue: number): CurrencyExposure {
  const currencies: Record<string, number> = { BRL: 0, USD: 0, EUR: 0, other: 0 };

  positions.forEach((pos) => {
    const value = pos.valorAtualBrl || pos.grossValue || 0;
    const currency = pos.moedaOriginal || pos.currency || 'BRL';

    if (currency in currencies) {
      currencies[currency] += value;
    } else {
      currencies.other += value;
    }
  });

  return {
    BRL: { value: currencies.BRL, percentage: totalValue > 0 ? (currencies.BRL / totalValue) * 100 : 0 },
    USD: { value: currencies.USD, percentage: totalValue > 0 ? (currencies.USD / totalValue) * 100 : 0 },
    EUR: { value: currencies.EUR, percentage: totalValue > 0 ? (currencies.EUR / totalValue) * 100 : 0 },
    other: { value: currencies.other, percentage: totalValue > 0 ? (currencies.other / totalValue) * 100 : 0 },
  };
}

/**
 * Calcular score de diversificação (0-100)
 * Baseado em Herfindahl-Hirschman Index normalizado
 */
function calculateDiversificationScore(
  positions: Position[],
  allocationByClass: Record<ClasseAtivo, { value: number; percentage: number }>
): number {
  if (positions.length === 0) return 0;

  // HHI das classes
  const classValues = Object.values(allocationByClass).map((a) => a.percentage / 100);
  const hhi = classValues.reduce((sum, p) => sum + p * p, 0);

  // Normalizar HHI para score 0-100
  // HHI varia de 1/n (diversificado) a 1 (concentrado)
  const minHhi = 1 / Object.keys(allocationByClass).length;
  const maxHhi = 1;
  const score = ((maxHhi - hhi) / (maxHhi - minHhi)) * 100;

  return Math.max(0, Math.min(100, score));
}

/**
 * Gerar alertas de concentração e desequilíbrio
 */
function generateAlerts(
  concentration: ConcentrationMetrics,
  currency: CurrencyExposure,
  positionCount: number,
  allocationByClass: Record<ClasseAtivo, { value: number; percentage: number }>
): Alert[] {
  const alerts: Alert[] = [];

  // Alerta: concentração em ativo único
  if (concentration.top1Percentage > 20) {
    alerts.push({
      type: 'HIGH_CONCENTRATION_ASSET',
      severity: concentration.top1Percentage > 40 ? 'critical' : 'warning',
      message: `Posição dominante: ${concentration.top1Percentage.toFixed(1)}% da carteira em um único ativo`,
      percentage: concentration.top1Percentage,
    });
  }

  // Alerta: concentração em classe
  Object.entries(allocationByClass).forEach(([classe, { percentage }]) => {
    if (percentage > 40) {
      alerts.push({
        type: 'HIGH_CONCENTRATION_CLASS',
        severity: percentage > 60 ? 'critical' : 'warning',
        message: `Classe ${classe} representa ${percentage.toFixed(1)}% da carteira`,
        percentage,
      });
    }
  });

  // Alerta: exposição cambial desequilibrada
  if (currency.USD.percentage > 50 || currency.EUR.percentage > 20) {
    alerts.push({
      type: 'UNBALANCED_CURRENCY',
      severity: 'info',
      message: `Exposição cambial significativa: USD ${currency.USD.percentage.toFixed(1)}%`,
      percentage: currency.USD.percentage,
    });
  }

  // Alerta: baixa diversificação (poucos ativos)
  if (positionCount < 5) {
    alerts.push({
      type: 'LOW_DIVERSIFICATION',
      severity: 'warning',
      message: `Carteira com apenas ${positionCount} posição(ões). Recomenda-se mínimo 5 para diversificação básica`,
    });
  }

  return alerts;
}
