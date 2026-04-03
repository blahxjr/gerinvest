export type AssetClass =
  | 'ACOES'
  | 'BDR'
  | 'ETF'
  | 'FII'
  | 'FIAGRO'
  | 'RENDA_FIXA'
  | 'TESOURO_DIRETO'
  | 'FUNDOS_MULTIMERCADO'
  | 'PREVIDENCIA'
  | 'CRYPTO'
  | 'OUTRO';

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  ACOES: 'Ações',
  BDR: 'BDR',
  ETF: 'ETF',
  FII: 'FII',
  FIAGRO: 'Fiagro',
  RENDA_FIXA: 'Renda Fixa',
  TESOURO_DIRETO: 'Tesouro Direto',
  FUNDOS_MULTIMERCADO: 'Fundos Multimercado',
  PREVIDENCIA: 'Previdência',
  CRYPTO: 'Criptoativos',
  OUTRO: 'Outros',
};

export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  ACOES: '#3b82f6',        // blue-500
  BDR: '#8b5cf6',          // violet-500
  ETF: '#06b6d4',          // cyan-500
  FII: '#10b981',          // emerald-500
  FIAGRO: '#84cc16',       // lime-500
  RENDA_FIXA: '#f59e0b',   // amber-500
  TESOURO_DIRETO: '#f97316', // orange-500
  FUNDOS_MULTIMERCADO: '#ec4899', // pink-500
  PREVIDENCIA: '#6366f1',  // indigo-500
  CRYPTO: '#14b8a6',       // teal-500
  OUTRO: '#94a3b8',        // slate-400
};

export type Currency = 'BRL';
