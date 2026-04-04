/**
 * B3 CSV Importer - Segue padrão googleSheetsImporter.ts
 * Converte CSV do extrato B3 → Position objects prontos para BD
 */

import { Position } from '@/core/domain/position';
import { ImportResult, PortfolioImportMetrics } from '@/core/domain/portfolio';
import { validatePosition } from '@/core/domain/validation';
import { buildPositionFromRaw, RawRow } from './positionMapper';
import { ClasseAtivo } from '@/core/domain/types';

export async function importPositionsFromB3CSV(
  csvContent: string,
  options?: { instituicao?: string; carteiraNome?: string }
): Promise<ImportResult> {
  const lines = csvContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  const aggregatedPositions: Position[] = [];
  const perAssetClassMap: Record<string, PortfolioImportMetrics> = {
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

  let currentSection: ClasseAtivo | null = null;
  let headerIndices: Record<string, number> = {};
  let rowIndex = 0;

  for (const line of lines) {
    rowIndex++;

    const section = detectB3Section(line);
    if (section) {
      currentSection = mapB3SectionToAssetClass(section);
      continue;
    }

    if (!currentSection) continue;

    if (isHeaderRow(line)) {
      headerIndices = parseB3Header(line);
      continue;
    }

    if (Object.keys(headerIndices).length === 0) continue;

    try {
      const rawRow = parseB3Row(line, headerIndices);
      if (!rawRow || Object.keys(rawRow).length === 0) continue;

      const position = buildPositionFromRaw(currentSection, rawRow);
      position.institution = options?.instituicao || 'B3';
      position.instituicao = options?.instituicao || 'B3';

      const validation = validatePosition(position);

      if (!validation.valid) {
        perAssetClassMap[currentSection]?.errors.push({
          row: rowIndex,
          message: validation.errors.join('; '),
        });
        continue;
      }

      aggregatedPositions.push(validation.position);
      perAssetClassMap[currentSection].importedCount += 1;
      perAssetClassMap[currentSection].importedValue +=
        validation.position.valorAtualBruto ?? validation.position.grossValue ?? 0;
    } catch (error) {
      if (perAssetClassMap[currentSection]) {
        perAssetClassMap[currentSection].errors.push({
          row: rowIndex,
          message: `Erro ao fazer parse: ${String(error)}`,
        });
      }
    }
  }

  const totalValue = aggregatedPositions.reduce(
    (acc, pos) => acc + (pos.valorAtualBruto ?? pos.grossValue ?? 0),
    0
  );

  const perAssetClassArray = Object.values(perAssetClassMap).filter(
    (pc) => pc.importedCount > 0 || pc.errors.length > 0
  );

  return {
    positions: aggregatedPositions,
    totals: {
      totalCount: aggregatedPositions.length,
      totalValue,
    },
    perAssetClass: perAssetClassArray,
  };
}

function detectB3Section(line: string): 'acoes' | 'fundos' | 'renda_fixa' | null {
  const lower = line.toLowerCase();
  if (lower.includes('1-ações') || lower.includes('açoes') || lower.includes('mercado à vista'))
    return 'acoes';
  if (lower.includes('2-fundos') || lower.includes('fundo')) return 'fundos';
  if (lower.includes('3-renda fixa') || lower.includes('tesouro')) return 'renda_fixa';
  return null;
}

function mapB3SectionToAssetClass(section: 'acoes' | 'fundos' | 'renda_fixa'): ClasseAtivo {
  switch (section) {
    case 'acoes':
      return 'ACAO_BR';
    case 'fundos':
      return 'FUNDO';
    case 'renda_fixa':
      return 'RENDA_FIXA';
    default:
      return 'ALTERNATIVO';
  }
}

function isHeaderRow(line: string): boolean {
  const lower = line.toLowerCase();
  return (
    lower.includes('código') ||
    lower.includes('ticker') ||
    lower.includes('quantidade') ||
    lower.includes('preço') ||
    lower.includes('preco')
  );
}

function parseB3Header(line: string): Record<string, number> {
  const columns = line.split(';').map((c) => c.trim().toLowerCase());
  return {
    ticker: columns.findIndex((c) => c.includes('código') || c.includes('ticker')),
    quantity: columns.findIndex((c) => c.includes('quantidade') || c.includes('qtd')),
    price: columns.findIndex((c) => c.includes('preço') || c.includes('preco')),
    grossValue: columns.findIndex((c) => c.includes('valor')),
  };
}

function parseB3Row(line: string, headerIndices: Record<string, number>): RawRow | null {
  const parts = line.split(';').map((p) => p.trim());

  if (headerIndices.ticker < 0) return null;

  const ticker = parts[headerIndices.ticker];
  if (!ticker) return null;

  const row: RawRow = {
    'Código de Negociação': ticker,
    Quantidade: headerIndices.quantity >= 0 ? parts[headerIndices.quantity] : '',
    Preço: headerIndices.price >= 0 ? parts[headerIndices.price] : '',
    Valor: headerIndices.grossValue >= 0 ? parts[headerIndices.grossValue] : '',
    Instituição: 'B3',
  };

  return row;
}
