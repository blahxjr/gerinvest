import { normalizeCurrency, normalizeNumber, normalizeString } from './helpers';
import { Position } from '../../core/domain/position';

export type RawRow = Record<string, unknown>;

export function getCellValue(row: RawRow, candidates: string[]): string {
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

export function createPosition(overrides: Partial<Position>): Position {
  const base: Position = {
    id:
      overrides.id ||
      `${overrides.assetClass ?? 'OUTRO'}-${overrides.ticker ?? 'UNKNOWN'}-${overrides.account ?? 'UNKNOWN'}-${Math.random()
        .toString(36)
        .substring(2, 10)}`,
    assetClass: overrides.assetClass ?? 'OUTRO',
    ticker: overrides.ticker ?? '',
    description: overrides.description ?? '',
    institution: overrides.institution ?? '',
    account: overrides.account ?? '',
    quantity: overrides.quantity ?? 0,
    price: overrides.price ?? 0,
    grossValue:
      overrides.grossValue ??
      (overrides.quantity ?? 0) * (overrides.price ?? 0),
    currency: 'BRL',
    indexer: overrides.indexer,
    maturityDate: overrides.maturityDate,
    issuer: overrides.issuer,
  };
  return base;
}

export function buildPositionFromRaw(assetClass: Position['assetClass'], row: RawRow): Position {
  const ticker = getCellValue(row, ['código de negociação', 'código', 'código isin', 'ticker', 'papel', 'ativo']);
  const description = getCellValue(row, ['produto', 'descrição', 'nome', 'fundo']);
  const institution = getCellValue(row, ['instituição', 'instituicao', 'corretora']);
  const account = getCellValue(row, ['conta', 'carteira', 'carteira/conta']);

  const rawQuantity = getCellValue(row, ['quantidade', 'qtd', 'volume']);
  const rawPrice = getCellValue(row, ['preço de fechamento', 'preco de fechamento', 'preço atualizado', 'preco atualizado', 'preço', 'preco']);
  const rawGrossValue = getCellValue(row, ['valor atualizado', 'valor aplicado', 'valor bruto', 'valor liquido', 'valor líquido']);

  const quantity = normalizeNumber(rawQuantity);
  let price = normalizeCurrency(rawPrice);
  const grossValueRaw = normalizeNumber(rawGrossValue);
  const computedGross = quantity * price;

  let grossValue = grossValueRaw > 0 ? normalizeCurrency(rawGrossValue) : computedGross;

  if (price > 10_000_000) {
    price = price / 100;
  }
  if (grossValue > 10_000_000_000 && computedGross > 0) {
    grossValue = computedGross;
  }

  if (computedGross > 0 && Math.abs(grossValue - computedGross) / Math.max(1, computedGross) > 0.5) {
    grossValue = computedGross;
  }

  const indexer = getCellValue(row, ['indexador', 'indexer', 'indexacao']);
  const maturityDate = getCellValue(row, ['vencimento', 'data_de_vencimento', 'maturity_date', 'maturity']);
  const issuer = getCellValue(row, ['emissor', 'issuer']);

  return createPosition({
    assetClass,
    ticker,
    description,
    institution,
    account,
    quantity,
    price,
    grossValue,
    indexer: indexer || undefined,
    maturityDate: maturityDate || undefined,
    issuer: issuer || undefined,
  });
}

export function detectAssetClassBySheetName(sheetName: string): Position['assetClass'] {
  const normalized = sheetName.toLowerCase().trim();
  switch (normalized) {
    case 'acoes':
      return 'ACOES';
    case 'bdr':
      return 'BDR';
    case 'etf':
      return 'ETF';
    case 'fundo de investimento':
      return 'FII';
    case 'renda fixa':
      return 'RENDA_FIXA';
    case 'tesouro direto':
    case 'tesouro':
      return 'TESOURO_DIRETO';
    default:
      return 'OUTRO';
  }
}
