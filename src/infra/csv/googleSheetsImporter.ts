import path from 'path';
import { getSheetsService, extractSpreadsheetId } from '../../lib/googleSheets';
import { Position } from '../../core/domain/position';
import { ImportResult, PortfolioImportMetrics } from '../../core/domain/portfolio';
import { validatePosition } from '../../core/domain/validation';
import { ClasseAtivo } from '../../core/domain/types';
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

/**
 * Importa posições do Google Sheets DIRETAMENTE para PostgreSQL
 * Sem passar por CSVs intermediários
 */
export async function importPositionsFromGoogleSheetToPostgres(
  spreadsheetUrl: string,
  options: { carteiraNome?: string; instituicao?: string } = {}
) {
  const { carteiraNome = 'Minha Carteira B3', instituicao = 'B3' } = options;
  
  // Reutiliza a lógica de leitura da planilha
  const importResult = await importPositionsFromGoogleSheet(spreadsheetUrl);
  
  // Importar para PostgreSQL
  const { getPortfolioRepository } = await import('../repositories/postgresPortfolioRepository');
  const repo = getPortfolioRepository();

  // Criar ou obter carteira
  const carteiras = await repo.getAllCarteiras();
  let carteira = carteiras.find((c) => c.nome === carteiraNome);
  
  if (!carteira) {
    carteira = await repo.createCarteira({
      nome: carteiraNome,
      moedaBase: 'BRL',
    });
  }

  let ativosImportados = 0;
  let positionsImportadas = 0;
  const errosImportacao: string[] = [];

  // Map para rastrear ativos
  const ativoIdMap = new Map<string, string>();

  // Problema: preciso mapear Position para ClasseAtivo
  // Position.classe pode ter valores antigos, vou converter
  const ativosPorTicker = new Map<string, any>();

  // Criar/obter ativos
  for (const position of importResult.positions) {
    const ticker = position.ticker || position.nome;
    if (!ticker || ativosPorTicker.has(ticker)) continue;

    try {
      // Tenta encontrar ativo existente
      const existente = await repo.getAtivoByTicker(ticker);
      
      if (existente) {
        ativoIdMap.set(ticker, existente.id);
        ativosPorTicker.set(ticker, existente);
      } else {
        // Criar novo ativo - converter classe
        const novoAtivo = await repo.createAtivo({
          ticker,
          nome: position.nome || position.descricao || ticker,
          classe: mapPositionClasseToAtivoClasse(position.classe || 'ACAO_BR'),
          moeda: position.moedaOriginal || 'BRL',
        });
        ativoIdMap.set(ticker, novoAtivo.id);
        ativosPorTicker.set(ticker, novoAtivo);
        ativosImportados++;
      }
    } catch (error) {
      errosImportacao.push(`Erro ao criar ativo ${ticker}: ${String(error)}`);
    }
  }

  // Importar posições
  for (const position of importResult.positions) {
    try {
      const ticker = position.ticker || position.nome;
      const ativoId = ativoIdMap.get(ticker);

      if (!ativoId) {
        errosImportacao.push(`Ativo ${ticker} não foi criado`);
        continue;
      }

      await repo.createPosicao({
        carteiraId: carteira.id,
        ativoId,
        quantidade: position.quantidade,
        precoMedio: position.precoMedio,
        valorAtualBrl: position.valorAtualBrl || position.valorAtualBruto || 0,
        moedaOriginal: position.moedaOriginal || 'BRL',
        instituicao: position.instituicao || instituicao,
        dataEntrada: position.dataEntrada ? new Date(position.dataEntrada) : undefined,
      });
      positionsImportadas++;
    } catch (error) {
      // Ignora erro de duplicata (UNIQUE constraint)
      if (String(error).includes('duplicate') || String(error).includes('UNIQUE')) {
        // Posição já existe, skip
      } else {
        errosImportacao.push(`Erro ao importar posição ${position.ticker}: ${String(error)}`);
      }
    }
  }

  return {
    sucesso: true,
    carteira: { id: carteira.id, nome: carteira.nome },
    ativosImportados,
    positionsImportadas,
    erros: errosImportacao.length > 0 ? errosImportacao : undefined,
    resumo: {
      totalPositoes: importResult.positions.length,
      processadas: positionsImportadas,
      errosDetectados: errosImportacao.length,
    },
  };
}

/**
 * Converte classe de Position (antiga) para ClasseAtivo (nova)
 */
function mapPositionClasseToAtivoClasse(classe: string): ClasseAtivo {
  const mapping: Record<string, ClasseAtivo> = {
    ACAO_BR: 'ACAO_BR',
    ACOES: 'ACAO_BR',
    BDR: 'BDR',
    ETF_BR: 'ETF_BR',
    ETF: 'ETF_BR',
    FII: 'FII',
    FUNDO: 'FUNDO',
    RENDA_FIXA: 'RENDA_FIXA',
    REIT: 'REIT',
    CRIPTO: 'CRIPTO',
    ACAO_EUA: 'ACAO_EUA',
    ETF_EUA: 'ETF_EUA',
    PREVIDENCIA: 'PREVIDENCIA',
    POUPANCA: 'POUPANCA',
    ALTERNATIVO: 'ALTERNATIVO',
  };
  return mapping[classe] || 'ALTERNATIVO';
}
