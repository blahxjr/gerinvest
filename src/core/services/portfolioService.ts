import { Position } from '../domain/position';
import { AllocationEntry, ConcentrationMetrics, PortfolioSummary } from '../domain/portfolio';
import { ClasseAtivo } from '../domain/types';

type QuoteInput = { price: number; change?: number };

export type MarkToMarketMetrics = {
  liveTotalValue: number;
  costBasisValue: number;
  pnlValue: number;
  pnlPercentage: number;
  coveredPositions: number;
  totalPositions: number;
};

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

export function getMarkToMarketMetrics(
  positions: Position[],
  quotesByTicker: Record<string, QuoteInput>,
): MarkToMarketMetrics {
  let liveTotalValue = 0;
  let costBasisValue = 0;
  let coveredPositions = 0;

  for (const position of positions) {
    const ticker = (position.ticker ?? '').trim().toUpperCase();
    const quantity = position.quantidade ?? position.quantity ?? 0;
    const averagePrice = position.precoMedio ?? position.price ?? 0;

    if (!ticker || quantity <= 0) continue;

    const quote = quotesByTicker[ticker];
    if (!quote || quote.price <= 0) continue;

    coveredPositions += 1;
    liveTotalValue += quote.price * quantity;
    costBasisValue += averagePrice * quantity;
  }

  const pnlValue = liveTotalValue - costBasisValue;
  const pnlPercentage = costBasisValue === 0 ? 0 : (pnlValue / costBasisValue) * 100;

  return {
    liveTotalValue,
    costBasisValue,
    pnlValue,
    pnlPercentage,
    coveredPositions,
    totalPositions: positions.length,
  };
}
