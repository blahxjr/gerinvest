import { ClasseAtivo, AssetClass } from './types';
import { Position } from './position';

export type PortfolioSummary = {
  totalInvested: number;
  totalPositions: number;
  uniqueTickers: number;
  uniqueAccounts: number;
  uniqueInstitutions: number;
  lastImportDate?: string;
};

export type AllocationEntry = {
  classe?: ClasseAtivo;
  institution?: string;
  value: number;
  percentage: number;
};

export type ConcentrationMetrics = {
  top1Percentage: number;
  top3Percentage: number;
  top5Percentage: number;
  largestPositionValue: number;
  largestPositionPercentage: number;
};

export type PortfolioImportMetrics = {
  classe: ClasseAtivo;
  importedCount: number;
  importedValue: number;
  errors: Array<{ row: number; message: string }>;
};

export type ImportResult = {
  positions: Position[];
  totals: {
    totalCount: number;
    totalValue: number;
  };
  perAssetClass: PortfolioImportMetrics[];
};
