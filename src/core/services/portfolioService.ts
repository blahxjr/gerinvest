import { Position } from '../domain/position';
import { AllocationEntry, ConcentrationMetrics, PortfolioSummary } from '../domain/portfolio';
import { AssetClass } from '../domain/types';

export function getPortfolioSummary(positions: Position[]): PortfolioSummary {
  const totalInvested = positions.reduce((acc, position) => acc + position.grossValue, 0);
  const uniqueTickers = new Set(positions.map((p) => p.ticker)).size;
  const uniqueAccounts = new Set(positions.map((p) => p.account)).size;
  const uniqueInstitutions = new Set(positions.map((p) => p.institution)).size;

  return {
    totalInvested,
    totalPositions: positions.length,
    uniqueTickers,
    uniqueAccounts,
    uniqueInstitutions,
  };
}

export function getAllocationByAssetClass(positions: Position[]): AllocationEntry[] {
  const totals: Record<AssetClass, number> = {
    ACOES: 0,
    BDR: 0,
    ETF: 0,
    FII: 0,
    FIAGRO: 0,
    RENDA_FIXA: 0,
    TESOURO_DIRETO: 0,
  };

  positions.forEach((position) => {
    totals[position.assetClass] = (totals[position.assetClass] || 0) + position.grossValue;
  });

  const total = Object.values(totals).reduce<number>((sum, value) => sum + value, 0);

  return (Object.entries(totals) as Array<[AssetClass, number]>).map(([assetClass, value]) => ({
    assetClass,
    value,
    percentage: total === 0 ? 0 : (value / total) * 100,
  }));
}

export function getAllocationByInstitution(positions: Position[]): AllocationEntry[] {
  const totals: Record<string, number> = {};
  positions.forEach((position) => {
    const institution = position.institution || 'OUTROS';
    totals[institution] = (totals[institution] ?? 0) + position.grossValue;
  });

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return Object.entries(totals)
    .map(([institution, value]) => ({ institution, value, percentage: total === 0 ? 0 : (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export function getTopPositions(positions: Position[], limit = 10): Position[] {
  return positions
    .slice()
    .sort((a, b) => b.grossValue - a.grossValue)
    .slice(0, limit);
}

export function getConcentrationMetrics(positions: Position[]): ConcentrationMetrics {
  const total = positions.reduce((sum, p) => sum + p.grossValue, 0);
  const sorted = positions.slice().sort((a, b) => b.grossValue - a.grossValue);

  const top1 = sorted.slice(0, 1).reduce((sum, p) => sum + p.grossValue, 0);
  const top3 = sorted.slice(0, 3).reduce((sum, p) => sum + p.grossValue, 0);
  const top5 = sorted.slice(0, 5).reduce((sum, p) => sum + p.grossValue, 0);

  const largestPositionValue = sorted[0]?.grossValue ?? 0;
  const largestPositionPercentage = total === 0 ? 0 : (largestPositionValue / total) * 100;

  return {
    top1Percentage: total === 0 ? 0 : (top1 / total) * 100,
    top3Percentage: total === 0 ? 0 : (top3 / total) * 100,
    top5Percentage: total === 0 ? 0 : (top5 / total) * 100,
    largestPositionValue,
    largestPositionPercentage,
  };
}

export function getFixedVsVariableRatio(positions: Position[]): { fixed: number; variable: number; fixedPercentage: number; variablePercentage: number } {
  const fixedClasses: AssetClass[] = ['RENDA_FIXA', 'TESOURO_DIRETO'];
  const variableClasses: AssetClass[] = ['ACOES', 'BDR', 'ETF', 'FII', 'FIAGRO'];

  const fixed = positions.filter((p) => fixedClasses.includes(p.assetClass)).reduce((sum, p) => sum + p.grossValue, 0);
  const variable = positions.filter((p) => variableClasses.includes(p.assetClass)).reduce((sum, p) => sum + p.grossValue, 0);
  const total = fixed + variable;

  return {
    fixed,
    variable,
    fixedPercentage: total === 0 ? 0 : (fixed / total) * 100,
    variablePercentage: total === 0 ? 0 : (variable / total) * 100,
  };
}
