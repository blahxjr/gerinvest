import ExcelJS from 'exceljs';
import { Position } from '../../core/domain/position';
import { ImportResult, PortfolioImportMetrics } from '../../core/domain/portfolio';
import { ClasseAtivo } from '../../core/domain/types';
import { validatePosition } from '../../core/domain/validation';
import { RawRow, buildPositionFromRaw, detectAssetClassBySheetName } from './positionMapper';
import { normalizeCurrency, normalizeNumber, normalizeString } from './helpers';

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

function parseSheetRows(worksheet: ExcelJS.Worksheet): RawRow[] {
  const rows: RawRow[] = [];
  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];

  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? '').trim();
  });

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData: RawRow = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        const val = cell.value;
        rowData[header] = val instanceof Date ? val.toISOString() : (val ?? '');
      }
    });
    rows.push(rowData);
  });

  return rows;
}

export async function importPositionsFromExcel(buffer: Buffer | ArrayBuffer): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook();
  const buf: Buffer = Buffer.isBuffer(buffer)
    ? (buffer as Buffer)
    : Buffer.from(new Uint8Array(buffer as ArrayBuffer));
  // exceljs types use pre-generic Buffer; cast via unknown to satisfy type checker
  await workbook.xlsx.load(buf as unknown as Parameters<typeof workbook.xlsx.load>[0]);
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

  for (const worksheet of workbook.worksheets) {
    const sheetName = worksheet.name;
    if (!sheetName) continue;
    const normalizedName = sheetName.trim();

    const rows = parseSheetRows(worksheet);
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
