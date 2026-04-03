import fs from 'fs/promises';
import path from 'path';
import { read, utils, WorkSheet } from 'xlsx';
import { Position } from '../../core/domain/position';
import { ImportResult, PortfolioImportMetrics } from '../../core/domain/portfolio';
import { validatePosition } from '../../core/domain/validation';
import { writeCsv } from './csv-writer';
import { RawRow, buildPositionFromRaw, detectAssetClassBySheetName } from './positionMapper';
import { normalizeCurrency, normalizeNumber, normalizeString } from './helpers';

const OUTPUT_FOLDER = 'public/data';

function getCellValue(row: RawRow, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const lowered = candidate.toLowerCase().trim();
    const foundKey = keys.find((k) => k.toLowerCase().trim() === lowered);
    if (foundKey) {
      return normalizeString(row[foundKey]);
    }
  }
  return '';
}

function createPosition(overrides: Partial<Position>): Position {
  const base: Position = {
    id: `${overrides.assetClass ?? 'UNKNOWN'}-${overrides.ticker ?? 'UNKNOWN'}-${overrides.account ?? 'UNKNOWN'}-${Math.random().toString(36).substring(2, 10)}`,
    assetClass: overrides.assetClass ?? 'ACOES',
    ticker: overrides.ticker ?? '',
    description: overrides.description ?? '',
    institution: overrides.institution ?? '',
    account: overrides.account ?? '',
    quantity: overrides.quantity ?? 0,
    price: overrides.price ?? 0,
    grossValue: overrides.grossValue ?? (overrides.quantity ?? 0) * (overrides.price ?? 0),
    currency: 'BRL',
    indexer: overrides.indexer,
    maturityDate: overrides.maturityDate,
    issuer: overrides.issuer,
  };
  return base;
}

function parseSheetToPositions(sheetName: string, rows: RawRow[]): Position[] {
  const output: Position[] = [];

  rows.forEach((row) => {
    const relevantRow = row;
    if (Object.values(relevantRow).every((cell) => cell === '' || cell === null || cell === undefined)) {
      return;
    }

    const normalizedSheet = sheetName.toLowerCase().trim();
    let assetClass: Position['assetClass'] | undefined;

    switch (normalizedSheet) {
      case 'acoes':
        assetClass = 'ACOES';
        break;
      case 'bdr':
        assetClass = 'BDR';
        break;
      case 'etf':
        assetClass = 'ETF';
        break;
      case 'fundo de investimento': {
        const rawKind = getCellValue(relevantRow, ['tipo', 'categoria', 'classe', 'subtipo']);
        assetClass = rawKind.toUpperCase().includes('FIAGRO') ? 'FIAGRO' : 'FII';
        break;
      }
      case 'renda fixa':
        assetClass = 'RENDA_FIXA';
        break;
      case 'tesouro direto':
      case 'tesouro':
        assetClass = 'TESOURO_DIRETO';
        break;
      default:
        assetClass = undefined;
    }

    if (assetClass) {
      output.push(buildPositionFromRaw(assetClass, relevantRow));
    }
  });

  return output;
}

function parseSheetRows(sheet: WorkSheet): RawRow[] {
  const rows = utils.sheet_to_json<RawRow>(sheet, { defval: '' });
  return rows;
}

export async function importPositionsFromExcel(buffer: Buffer | ArrayBuffer): Promise<ImportResult> {
  const workbook = read(buffer, { type: Buffer.isBuffer(buffer) ? 'buffer' : 'array' });
  const aggregatedPositions: Position[] = [];

  const perAssetClass: Record<string, PortfolioImportMetrics> = {
    ACOES: { assetClass: 'ACOES', importedCount: 0, importedValue: 0, errors: [] },
    BDR: { assetClass: 'BDR', importedCount: 0, importedValue: 0, errors: [] },
    ETF: { assetClass: 'ETF', importedCount: 0, importedValue: 0, errors: [] },
    FII: { assetClass: 'FII', importedCount: 0, importedValue: 0, errors: [] },
    FIAGRO: { assetClass: 'FIAGRO', importedCount: 0, importedValue: 0, errors: [] },
    RENDA_FIXA: { assetClass: 'RENDA_FIXA', importedCount: 0, importedValue: 0, errors: [] },
    TESOURO_DIRETO: { assetClass: 'TESOURO_DIRETO', importedCount: 0, importedValue: 0, errors: [] },
  };

  for (const sheetName of workbook.SheetNames) {
    if (!sheetName) continue;
    const normalizedName = sheetName.trim();
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = parseSheetRows(sheet);
    const sheetPositions = parseSheetToPositions(normalizedName, rows);

    sheetPositions.forEach((position, idx) => {
      const validation = validatePosition(position);
      const assetClass = position.assetClass;
      const stats = perAssetClass[assetClass];

      if (!stats) {
        return;
      }

      if (validation.valid) {
        aggregatedPositions.push(validation.position);
        stats.importedCount += 1;
        stats.importedValue += validation.position.grossValue;
      } else {
        stats.errors.push({ row: idx + 2, message: validation.errors.join('; ') });
      }
    });
  }

  const totalValue = aggregatedPositions.reduce((acc, pos) => acc + pos.grossValue, 0);

  // Write per-sheet CSVs and consolidated CSV
  const byAssetClass: Record<string, Position[]> = {
    ACOES: [],
    BDR: [],
    ETF: [],
    FII: [],
    FIAGRO: [],
    RENDA_FIXA: [],
    TESOURO_DIRETO: [],
  };

  aggregatedPositions.forEach((position) => {
    if (!byAssetClass[position.assetClass]) {
      byAssetClass[position.assetClass] = [];
    }
    byAssetClass[position.assetClass].push(position);
  });

  const perAssetClassFilenames: Record<string, string> = {
    ACOES: 'acoes.csv',
    BDR: 'bdr.csv',
    ETF: 'etf.csv',
    FII: 'fundos.csv',
    FIAGRO: 'fundos.csv',
    RENDA_FIXA: 'renda-fixa.csv',
    TESOURO_DIRETO: 'tesouro-direto.csv',
  };

  for (const assetClass of Object.keys(byAssetClass)) {
    const records = byAssetClass[assetClass] || [];
    const filename = perAssetClassFilenames[assetClass] ?? `${assetClass.toLowerCase()}.csv`;

    await writeCsv(path.join(OUTPUT_FOLDER, filename), records, [
      'id',
      'assetClass',
      'ticker',
      'description',
      'institution',
      'account',
      'quantity',
      'price',
      'grossValue',
      'currency',
      'indexer',
      'maturityDate',
      'issuer',
    ]);
  }

  await writeCsv(path.join(OUTPUT_FOLDER, 'portfolio-positions.csv'), aggregatedPositions, [
    'id',
    'assetClass',
    'ticker',
    'description',
    'institution',
    'account',
    'quantity',
    'price',
    'grossValue',
    'currency',
    'indexer',
    'maturityDate',
    'issuer',
  ]);

  const metrics = Object.values(perAssetClass);

  const result: ImportResult = {
    positions: aggregatedPositions,
    totals: {
      totalCount: aggregatedPositions.length,
      totalValue: totalValue,
    },
    perAssetClass: metrics,
  };

  return result;
}
