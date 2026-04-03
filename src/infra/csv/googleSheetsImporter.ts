import path from 'path';
import { getSheetsService, extractSpreadsheetId } from '../../lib/googleSheets';
import { Position } from '../../core/domain/position';
import { ImportResult, PortfolioImportMetrics } from '../../core/domain/portfolio';
import { validatePosition } from '../../core/domain/validation';
import { writeCsv } from './csv-writer';
import { buildPositionFromRaw, detectAssetClassBySheetName } from './positionMapper';

const OUTPUT_FOLDER = 'public/data';

function toRawRow(header: string[], row: Array<unknown>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  header.forEach((column, i) => {
    obj[column] = row[i] ?? '';
  });
  return obj;
}

function isEmptyRow(row: Record<string, unknown>): boolean {
  return Object.values(row).every((v) => v === '' || v === null || v === undefined);
}

export async function importPositionsFromGoogleSheet(spreadsheetUrl: string): Promise<ImportResult> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  const sheetsService = getSheetsService();

  const spreadsheet = await sheetsService.spreadsheets.get({ spreadsheetId });
  const sheets = spreadsheet.data.sheets ?? [];

  const aggregatedPositions: Position[] = [];

  const perAssetClass: Record<string, PortfolioImportMetrics> = {
    ACOES: { assetClass: 'ACOES', importedCount: 0, importedValue: 0, errors: [] },
    BDR: { assetClass: 'BDR', importedCount: 0, importedValue: 0, errors: [] },
    ETF: { assetClass: 'ETF', importedCount: 0, importedValue: 0, errors: [] },
    FII: { assetClass: 'FII', importedCount: 0, importedValue: 0, errors: [] },
    FIAGRO: { assetClass: 'FIAGRO', importedCount: 0, importedValue: 0, errors: [] },
    RENDA_FIXA: { assetClass: 'RENDA_FIXA', importedCount: 0, importedValue: 0, errors: [] },
    TESOURO_DIRETO: { assetClass: 'TESOURO_DIRETO', importedCount: 0, importedValue: 0, errors: [] },
    OUTRO: { assetClass: 'OUTRO', importedCount: 0, importedValue: 0, errors: [] },
  };

  for (const sheet of sheets) {
    const sheetName = sheet.properties?.title;
    if (!sheetName) continue;

    const assetClass = detectAssetClassBySheetName(sheetName);
    const range = `${sheetName}!A1:Z9999`;
    const response = await sheetsService.spreadsheets.values.get({ spreadsheetId, range });
    const values = response.data.values ?? [];
    if (values.length < 2) continue;

    const header = values[0].map(String);

    for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
      const row = values[rowIndex];
      const rawRow = toRawRow(header, row);
      if (isEmptyRow(rawRow)) continue;

      const position = buildPositionFromRaw(assetClass, rawRow);
      const validation = validatePosition(position);

      if (!validation.valid) {
        perAssetClass[assetClass]?.errors.push({ row: rowIndex + 1, message: validation.errors.join('; ') });
        continue;
      }

      aggregatedPositions.push(validation.position);
      perAssetClass[assetClass].importedCount += 1;
      perAssetClass[assetClass].importedValue += validation.position.grossValue;
    }
  }

  const totalValue = aggregatedPositions.reduce((acc, pos) => acc + pos.grossValue, 0);

  const perAssetClassFileMapping: Record<string, string> = {
    ACOES: 'acoes.csv',
    BDR: 'bdr.csv',
    ETF: 'etf.csv',
    FII: 'fundos.csv',
    FIAGRO: 'fundos.csv',
    RENDA_FIXA: 'renda-fixa.csv',
    TESOURO_DIRETO: 'tesouro-direto.csv',
    OUTRO: 'outro.csv',
  };

  const recordsByClass: Record<string, Position[]> = {};
  aggregatedPositions.forEach((position) => {
    if (!recordsByClass[position.assetClass]) recordsByClass[position.assetClass] = [];
    recordsByClass[position.assetClass].push(position);
  });

  for (const [assetClassKey, records] of Object.entries(recordsByClass)) {
    const filename = perAssetClassFileMapping[assetClassKey] ?? `${assetClassKey.toLowerCase()}.csv`;
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

  return {
    positions: aggregatedPositions,
    totals: {
      totalCount: aggregatedPositions.length,
      totalValue,
    },
    perAssetClass: Object.values(perAssetClass),
  };
}
