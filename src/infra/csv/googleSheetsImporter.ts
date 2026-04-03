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

  for (const sheet of sheets) {
    const sheetName = sheet.properties?.title;
    if (!sheetName) continue;

    const assetClass = detectAssetClassBySheetName(sheetName);
    if (!assetClass) continue;  // Skip sheets with unknown asset class

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
      perAssetClass[assetClass].importedValue += (validation.position.valorAtualBruto ?? validation.position.grossValue ?? 0);
    }
  }

  const totalValue = aggregatedPositions.reduce((acc, pos) => acc + (pos.valorAtualBruto ?? pos.grossValue ?? 0), 0);

  const perAssetClassFileMapping: Record<string, string> = {
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

  const recordsByClass: Record<string, Position[]> = {};
  aggregatedPositions.forEach((position) => {
    const classe = (position.assetClass || position.classe) as string;
    if (!recordsByClass[classe]) recordsByClass[classe] = [];
    recordsByClass[classe].push(position);
  });

  for (const [assetClassKey, records] of Object.entries(recordsByClass)) {
    const filename = perAssetClassFileMapping[assetClassKey] ?? `${assetClassKey.toLowerCase()}.csv`;
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

  return {
    positions: aggregatedPositions,
    totals: {
      totalCount: aggregatedPositions.length,
      totalValue,
    },
    perAssetClass: Object.values(perAssetClass),
  };
}
