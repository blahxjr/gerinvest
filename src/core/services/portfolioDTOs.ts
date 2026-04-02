import { AllocationEntry, ConcentrationMetrics, PortfolioSummary } from '../domain/portfolio';
import { Position } from '../domain/position';

export type DashboardData = {
  summary: PortfolioSummary & { lastImportDate?: string };
  allocationByAssetClass: AllocationEntry[];
  allocationByInstitution: AllocationEntry[];
  topPositions: Position[];
  concentration: ConcentrationMetrics;
  fixedVsVariable: {
    fixed: number;
    variable: number;
    fixedPercentage: number;
    variablePercentage: number;
  };
  positions: Position[];
};
