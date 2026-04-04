import fs from 'fs/promises';
import path from 'path';
import { AssetClass, ClasseAtivo, Currency } from '../../core/domain/types';
import { Position } from '../../core/domain/position';
import { PortfolioSummary } from '../../core/domain/portfolio';
import { PortfolioRepository } from './portfolioRepository';
import { readCsv } from '../csv/csv-reader';
import { writeCsv } from '../csv/csv-writer';
import { normalizeCurrency } from '../csv/helpers';

const DEFAULT_POSITIONS_CSV = path.join('public', 'data', 'portfolio-positions.csv');
const FALLBACK_POSITIONS_CSV = path.join('docs', 'csvs', 'portfolio-positions.csv');
const DOCS_CSVS_FOLDER = path.join('docs', 'csvs');

const mapRowToPosition = (row: Record<string, unknown>): Position => {
  const assetClass = (row.classe || row.assetClass || 'ALTERNATIVO') as ClasseAtivo;
  const grossValue = normalizeCurrency(row.grossValue || row.valorAtualBruto || 0);
  const valorAtualBrl = normalizeCurrency(row.valorAtualBrl || grossValue || 0);
  
  return {
    id: String(row.id),
    classe: assetClass,
    assetClass: assetClass,
    nome: String(row.nome || row.description || row.ticker || 'Desconhecido'),
    ticker: row.ticker ? String(row.ticker) : undefined,
    description: row.description ? String(row.description) : undefined,
    instituicao: row.instituicao ? String(row.instituicao) : undefined,
    institution: row.institution ? String(row.institution) : undefined,
    conta: row.conta ? String(row.conta) : undefined,
    account: row.account ? String(row.account) : undefined,
    quantidade: row.quantidade ? Number(row.quantidade) : undefined,
    quantity: row.quantity ? Number(row.quantity) : undefined,
    precoMedio: row.precoMedio ? normalizeCurrency(row.precoMedio) : undefined,
    price: row.price ? normalizeCurrency(row.price) : undefined,
    valorAtualBruto: grossValue,
    grossValue: grossValue,
    valorAtualBrl: valorAtualBrl,
    moedaOriginal: (row.moedaOriginal || row.currency || 'BRL') as Currency,
    currency: (row.currency || 'BRL') as Currency,
    dataEntrada: row.dataEntrada ? String(row.dataEntrada) : undefined,
    maturityDate: row.maturityDate ? String(row.maturityDate) : undefined,
    indexer: row.indexer ? String(row.indexer) : undefined,
    issuer: row.issuer ? String(row.issuer) : undefined,
  };
};

export class CsvPortfolioRepository implements PortfolioRepository {
  private readonly csvPath: string;

  constructor(csvPath?: string) {
    this.csvPath = csvPath ?? DEFAULT_POSITIONS_CSV;
  }

  async getAllPositions(): Promise<Position[]> {
    let result = await readCsv(this.csvPath, mapRowToPosition);

    if (result.data.length === 0 && this.csvPath === DEFAULT_POSITIONS_CSV) {
      result = await readCsv(FALLBACK_POSITIONS_CSV, mapRowToPosition);
      if (result.data.length === 0) {
        result.data = await this.readAllDocsCsvs();
      }
    }

    return result.data;
  }

  private async readAllDocsCsvs(): Promise<Position[]> {
    const folderPath = path.resolve(process.cwd(), 'docs', 'csvs');
    try {
      const files = await fs.readdir(folderPath);
      const csvFiles = files.filter((file) => file.toLowerCase().endsWith('.csv'));

      const allPositions: Position[] = [];
      for (const file of csvFiles) {
        const filePath = path.join(folderPath, file);
        const result = await readCsv(filePath, mapRowToPosition);
        allPositions.push(...result.data);
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

    const totalInvested = positions.reduce((acc, pos) => acc + (pos.valorAtualBrl ?? pos.grossValue ?? 0), 0);
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

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const positions = await this.getAllPositions();
    const index = positions.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Position not found');

    const updated = { ...positions[index], ...updates };
    positions[index] = updated;

    await writeCsv(this.csvPath, positions);
    return updated;
  }

  async deletePosition(id: string): Promise<void> {
    const positions = await this.getAllPositions();
    const filtered = positions.filter(p => p.id !== id);
    if (filtered.length === positions.length) throw new Error('Position not found');

    await writeCsv(this.csvPath, filtered);
  }
}
