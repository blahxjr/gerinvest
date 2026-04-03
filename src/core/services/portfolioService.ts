import { Position } from '../domain/position';
import { AllocationEntry, ConcentrationMetrics, PortfolioSummary } from '../domain/portfolio';
import { ClasseAtivo } from '../domain/types';

// Helper function to get safe grossValue
const getGrossValue = (position: Position): number => {
  return position.valorAtualBruto ?? position.grossValue ?? 0;
};

const getAssetClass = (position: Position): ClasseAtivo => {
  return (position.assetClass ?? position.classe ?? 'ALTERNATIVO') as ClasseAtivo;
};

export function getPortfolioSummary(positions: Position[]): PortfolioSummary {
  const totalInvested = positions.reduce((acc, position) => acc + getGrossValue(position), 0);
  const uniqueTickers = new Set(positions.map((p) => p.ticker || p.nome)).size;
  const uniqueAccounts = new Set(positions.map((p) => p.account || p.conta)).size;
  const uniqueInstitutions = new Set(positions.map((p) => p.institution || p.instituicao)).size;

  return {
    totalInvested,
    totalPositions: positions.length,
    uniqueTickers,
    uniqueAccounts,
    uniqueInstitutions,
  };
}

export function getAllocationByAssetClass(positions: Position[]): AllocationEntry[] {
  const totals: Record<ClasseAtivo, number> = {
    ACAO_BR: 0,
    FII: 0,
    ETF_BR: 0,
    BDR: 0,
    ACAO_EUA: 0,
    ETF_EUA: 0,
    REIT: 0,
    FUNDO: 0,
    CRIPTO: 0,
    RENDA_FIXA: 0,
    POUPANCA: 0,
    PREVIDENCIA: 0,
    ALTERNATIVO: 0,
  };

  positions.forEach((position) => {
    const assetClass = getAssetClass(position);
    totals[assetClass] = (totals[assetClass] || 0) + getGrossValue(position);
  });

  const total = Object.values(totals).reduce<number>((sum, value) => sum + value, 0);

  return (Object.entries(totals) as Array<[ClasseAtivo, number]>).map(([classe, value]) => ({
    classe,
    value,
    percentage: total === 0 ? 0 : (value / total) * 100,
  }));
}

export function getAllocationByInstitution(positions: Position[]): AllocationEntry[] {
  const totals: Record<string, number> = {};
  positions.forEach((position) => {
    const institution = position.institution || position.instituicao || 'OUTROS';
    totals[institution] = (totals[institution] ?? 0) + getGrossValue(position);
  });

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return Object.entries(totals)
    .map(([institution, value]) => ({ institution, value, percentage: total === 0 ? 0 : (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export function getTopPositions(positions: Position[], limit = 10): Position[] {
  return positions
    .slice()
    .sort((a, b) => getGrossValue(b) - getGrossValue(a))
    .slice(0, limit);
}

export function getConcentrationMetrics(positions: Position[]): ConcentrationMetrics {
  const total = positions.reduce((sum, p) => sum + getGrossValue(p), 0);
  const sorted = positions.slice().sort((a, b) => getGrossValue(b) - getGrossValue(a));

  const top1 = sorted.slice(0, 1).reduce((sum, p) => sum + getGrossValue(p), 0);
  const top3 = sorted.slice(0, 3).reduce((sum, p) => sum + getGrossValue(p), 0);
  const top5 = sorted.slice(0, 5).reduce((sum, p) => sum + getGrossValue(p), 0);

  const largestPositionValue = getGrossValue(sorted[0] ?? { valorAtualBruto: 0 } as Position);
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
  const fixedClasses: ClasseAtivo[] = ['RENDA_FIXA', 'POUPANCA'];
  const variableClasses: ClasseAtivo[] = ['ACAO_BR', 'BDR', 'ETF_BR', 'FII', 'ACAO_EUA', 'ETF_EUA', 'REIT'];

  const fixed = positions.filter((p) => fixedClasses.includes(getAssetClass(p))).reduce((sum, p) => sum + getGrossValue(p), 0);
  const variable = positions.filter((p) => variableClasses.includes(getAssetClass(p))).reduce((sum, p) => sum + getGrossValue(p), 0);
  const total = fixed + variable;

  return {
    fixed,
    variable,
    fixedPercentage: total === 0 ? 0 : (fixed / total) * 100,
    variablePercentage: total === 0 ? 0 : (variable / total) * 100,
  };
}
