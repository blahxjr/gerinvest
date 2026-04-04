import { AssetClass } from '../../core/domain/types';
import { Position } from '../../core/domain/position';
import { PortfolioSummary } from '../../core/domain/portfolio';

export interface PortfolioRepository {
  getAllPositions(): Promise<Position[]>;
  getPositionsByAssetClass(assetClass: AssetClass): Promise<Position[]>;
  getSummary(): Promise<PortfolioSummary>;
  getLastImportDate?(): Promise<string | undefined>;
  updatePosition?(id: string, updates: Partial<Position>): Promise<Position>;
  deletePosition?(id: string): Promise<void>;
}
