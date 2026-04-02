import fs from 'fs/promises';
import path from 'path';
import { AssetClass } from '../../core/domain/types';
import { Position } from '../../core/domain/position';
import { PortfolioSummary } from '../../core/domain/portfolio';
import { PortfolioRepository } from './portfolioRepository';
import { readCsv } from '../csv/csv-reader';
import { normalizeCurrency } from '../csv/helpers';

const DEFAULT_POSITIONS_CSV = path.join('public', 'data', 'portfolio-positions.csv');
const FALLBACK_POSITIONS_CSV = path.join('docs', 'csvs', 'portfolio-positions.csv');
const DOCS_CSVS_FOLDER = path.join('docs', 'csvs');

const mapRowToPosition = (row: Record<string, any>): Position => {
  return {
    id: String(row.id),
    assetClass: row.assetClass as AssetClass,
    ticker: String(row.ticker),
    description: String(row.description || ''),
    institution: String(row.institution || ''),
    account: String(row.account || ''),
    quantity: Number(row.quantity || 0),
    price: normalizeCurrency(row.price),
    grossValue: normalizeCurrency(row.grossValue),
    currency: 'BRL',
    indexer: row.indexer ? String(row.indexer) : undefined,
    maturityDate: row.maturityDate ? String(row.maturityDate) : undefined,
    issuer: row.issuer ? String(row.issuer) : undefined,
  };
};

export class CsvPortfolioRepository implements PortfolioRepository {
  private readonly csvPath: string;

  constructor(csvPath?: string) {
    this.csvPath = csvPath ?? DEFAULT_POSITIONS_CSV;
  }

  async getAllPositions(): Promise<Position[]> {
    let positions = await readCsv(this.csvPath, mapRowToPosition);

    if (positions.length === 0 && this.csvPath === DEFAULT_POSITIONS_CSV) {
      positions = await readCsv(FALLBACK_POSITIONS_CSV, mapRowToPosition);
      if (positions.length === 0) {
        positions = await this.readAllDocsCsvs();
      }
    }

    return positions;
  }

  private async readAllDocsCsvs(): Promise<Position[]> {
    const folderPath = path.resolve(process.cwd(), 'docs', 'csvs');
    try {
      const files = await fs.readdir(folderPath);
      const csvFiles = files.filter((file) => file.toLowerCase().endsWith('.csv'));

      const allPositions: Position[] = [];
      for (const file of csvFiles) {
        const filePath = path.join(folderPath, file);
        const cnt = await readCsv(filePath, mapRowToPosition);
        allPositions.push(...cnt);
      }

      return allPositions;
    } catch {
      return [];
    }
  }

  async getPositionsByAssetClass(assetClass: AssetClass): Promise<Position[]> {
    const positions = await this.getAllPositions();
    return positions.filter((p) => p.assetClass === assetClass);
  }

  async getSummary(): Promise<PortfolioSummary> {
    const positions = await this.getAllPositions();

    const totalInvested = positions.reduce((acc, pos) => acc + pos.grossValue, 0);
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

  async getLastImportDate(): Promise<string | undefined> {
    try {
      const stat = await import('fs/promises').then((fs) => fs.stat(this.csvPath));
      return stat.mtime.toISOString();
    } catch {
      return undefined;
    }
  }
}
