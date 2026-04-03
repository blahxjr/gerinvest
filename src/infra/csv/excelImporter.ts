import fs from 'fs/promises';
import path from 'path';
import { read, utils, WorkSheet } from 'xlsx';
import { Position } from '../../core/domain/position';
import { ImportResult, PortfolioImportMetrics } from '../../core/domain/portfolio';
import { ClasseAtivo } from '../../core/domain/types';
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
  const assetClass = (overrides.assetClass ?? 'ACAO_BR') as ClasseAtivo;
  const base: Position = {
    id: `${assetClass}-${overrides.ticker ?? 'UNKNOWN'}-${overrides.account ?? 'UNKNOWN'}-${Math.random().toString(36).substring(2, 10)}`,
    classe: assetClass,
    assetClass: assetClass,
    nome: overrides.description ?? overrides.ticker ?? 'Desconhecido',
    ticker: overrides.ticker,
    description: overrides.description,
    institution: overrides.institution,
    instituicao: overrides.institution,
    account: overrides.account,
    conta: overrides.account,
    quantity: overrides.quantity,
    quantidade: overrides.quantity,
    price: overrides.price,
    precoMedio: overrides.price,
    grossValue: (overrides.quantity ?? 0) * (overrides.price ?? 0),
    valorAtualBruto: (overrides.quantity ?? 0) * (overrides.price ?? 0),
    valorAtualBrl: (overrides.quantity ?? 0) * (overrides.price ?? 0),
    currency: 'BRL',
    moedaOriginal: 'BRL',
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
    let assetClass: ClasseAtivo | undefined;

    switch (normalizedSheet) {
      case 'acoes':
        assetClass = 'ACAO_BR';
        break;
      case 'bdr':
        assetClass = 'BDR';
        break;
      case 'etf':
        assetClass = 'ETF_BR';
        break;
      case 'fundo de investimento': {
        const rawKind = getCellValue(relevantRow, ['tipo', 'categoria', 'classe', 'subtipo']);
        assetClass = 'FUNDO';
        break;
      }
      case 'renda fixa':
        assetClass = 'RENDA_FIXA';
        break;
      case 'tesouro direto':
      case 'tesouro':
        assetClass = 'RENDA_FIXA';
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
    ACAO_BR: { classe: 'ACAO_BR', importedCount: 0, importedValue: 0, errors: [] },
    BDR: { classe: 'BDR', importedCount: 0, importedValue: 0, errors: [] },
    ETF_BR: { classe: 'ETF_BR', importedCount: 0, importedValue: 0, errors: [] },
    FII: { classe: 'FII', importedCount: 0, importedValue: 0, errors: [] },
    FUNDO: { classe: 'FUNDO', importedCount: 0, importedValue: 0, errors: [] },
    RENDA_FIXA: { classe: 'RENDA_FIXA', importedCount: 0, importedValue: 0, errors: [] },
    ACAO_EUA: { classe: 'ACAO_EUA', importedCount: 0, importedValue: 0, errors: [] },
    ETF_EUA: { classe: 'ETF_EUA', importedCount: 0, importedValue: 0, errors: [] },
    REIT: { classe: 'REIT', importedCount: 0, importedValue: 0, errors: [] },
    CRIPTO: { classe: 'CRIPTO', importedCount: 0, importedValue: 0, errors: [] },
    POUPANCA: { classe: 'POUPANCA', importedCount: 0, importedValue: 0, errors: [] },
    PREVIDENCIA: { classe: 'PREVIDENCIA', importedCount: 0, importedValue: 0, errors: [] },
    ALTERNATIVO: { classe: 'ALTERNATIVO', importedCount: 0, importedValue: 0, errors: [] },
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
      const classe = (position.assetClass || position.classe) as ClasseAtivo;
      const stats = perAssetClass[classe];

      if (!stats) {
        return;
      }

      if (validation.valid) {
        aggregatedPositions.push(validation.position);
        stats.importedCount += 1;
        stats.importedValue += (validation.position.valorAtualBruto ?? validation.position.grossValue ?? 0);
      } else {
        stats.errors.push({ row: idx + 2, message: validation.errors.join('; ') });
      }
    });
  }

  const totalValue = aggregatedPositions.reduce((acc, pos) => acc + (pos.valorAtualBruto ?? pos.grossValue ?? 0), 0);

  // Write per-sheet CSVs and consolidated CSV
  const byAssetClass: Record<string, Position[]> = {};

  aggregatedPositions.forEach((position) => {
    const classe = (position.assetClass || position.classe) as ClasseAtivo;
    if (!byAssetClass[classe]) {
      byAssetClass[classe] = [];
    }
    byAssetClass[classe].push(position);
  });

  const perAssetClassFilenames: Record<string, string> = {
    ACAO_BR: 'acoes.csv',
    BDR: 'bdr.csv',
    ETF_BR: 'etf.csv',
    FII: 'fundos.csv',
    FUNDO: 'fundos.csv',
    RENDA_FIXA: 'renda-fixa.csv',
    ACAO_EUA: 'acoes-eua.csv',
    ETF_EUA: 'etf-eua.csv',
    REIT: 'reits.csv',
    CRIPTO: 'cripto.csv',
    POUPANCA: 'poupanca.csv',
    PREVIDENCIA: 'previdencia.csv',
    ALTERNATIVO: 'alternativo.csv',
  };

  for (const classe of Object.keys(byAssetClass)) {
    const records = byAssetClass[classe] || [];
    const filename = perAssetClassFilenames[classe] ?? `${classe.toLowerCase()}.csv`;

    await writeCsv(path.join(OUTPUT_FOLDER, filename), records, [
      'id',
      'nome',
      'classe',
      'ticker',
      'descricao',
      'instituicao',
      'conta',
      'quantidade',
      'precoMedio',
      'valorAtualBruto',
      'valorAtualBrl',
      'moedaOriginal',
      'dataEntrada',
      'dataVencimento',
    ]);
  }

  await writeCsv(path.join(OUTPUT_FOLDER, 'portfolio-positions.csv'), aggregatedPositions, [
    'id',
    'nome',
    'classe',
    'ticker',
    'descricao',
    'instituicao',
    'conta',
    'quantidade',
    'precoMedio',
    'valorAtualBruto',
    'valorAtualBrl',
    'moedaOriginal',
    'dataEntrada',
    'dataVencimento',
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
