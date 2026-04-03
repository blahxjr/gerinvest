/**
 * ClasseAtivo: 13 classes principais de ativos
 * Alinhado com docs/ai/03-domain-model.md
 */
export type ClasseAtivo =
  | 'ACAO_BR'
  | 'FII'
  | 'ETF_BR'
  | 'BDR'
  | 'ACAO_EUA'
  | 'ETF_EUA'
  | 'REIT'
  | 'FUNDO'
  | 'CRIPTO'
  | 'RENDA_FIXA'
  | 'POUPANCA'
  | 'PREVIDENCIA'
  | 'ALTERNATIVO';

/**
 * Subclasses permitem diagnóstico granular dentro de cada classe
 * Exemplos em docs/ai/03-domain-model.md
 */
export type SubclasseAtivo = 
  // FII
  | 'FII_TIJOLO'
  | 'FII_PAPEL'
  | 'FII_FOF'
  | 'FII_DESENVOLVIMENTO'
  // Cripto
  | 'CRIPTO_BASE'
  | 'CRIPTO_INFRAESTRUTURA'
  | 'CRIPTO_DEFI'
  | 'CRIPTO_ESPECULATIVO'
  // Fundo
  | 'FUNDO_RENDA_FIXA'
  | 'FUNDO_MULTIMERCADO'
  | 'FUNDO_ACOES'
  | 'FUNDO_CAMBIAL'
  | 'FUNDO_FOF'
  // Renda Fixa
  | 'RF_POS_FIXADO'
  | 'RF_IPCA'
  | 'RF_PREFIXADO'
  | 'RF_TESOURO';

/**
 * Rótulos para exibição na UI
 */
export const CLASSE_ATIVO_LABELS: Record<ClasseAtivo, string> = {
  ACAO_BR: 'Ações B3',
  FII: 'FII',
  ETF_BR: 'ETF (B3)',
  BDR: 'BDR',
  ACAO_EUA: 'Ações EUA',
  ETF_EUA: 'ETF (EUA)',
  REIT: 'REIT',
  FUNDO: 'Fundos',
  CRIPTO: 'Criptoativos',
  RENDA_FIXA: 'Renda Fixa',
  POUPANCA: 'Poupança',
  PREVIDENCIA: 'Previdência',
  ALTERNATIVO: 'Alternativos',
};

/**
 * Cores para gráficos e visualização
 */
export const CLASSE_ATIVO_COLORS: Record<ClasseAtivo, string> = {
  ACAO_BR: '#3b82f6',        // blue-500
  FII: '#10b981',            // emerald-500
  ETF_BR: '#06b6d4',         // cyan-500
  BDR: '#8b5cf6',            // violet-500
  ACAO_EUA: '#1e40af',       // blue-800
  ETF_EUA: '#0891b2',        // cyan-600
  REIT: '#7c2d12',           // orange-900
  FUNDO: '#ec4899',          // pink-500
  CRIPTO: '#14b8a6',         // teal-500
  RENDA_FIXA: '#f59e0b',     // amber-500
  POUPANCA: '#84cc16',       // lime-500
  PREVIDENCIA: '#6366f1',    // indigo-500
  ALTERNATIVO: '#94a3b8',    // slate-400
};

/**
 * Rótulos para subclasses (se houver)
 */
export const SUBCLASSE_ATIVO_LABELS: Record<SubclasseAtivo, string> = {
  FII_TIJOLO: 'FII - Tijolo',
  FII_PAPEL: 'FII - Papel',
  FII_FOF: 'FII - FOF',
  FII_DESENVOLVIMENTO: 'FII - Desenvolvimento',
  CRIPTO_BASE: 'Cripto - Base',
  CRIPTO_INFRAESTRUTURA: 'Cripto - Infraestrutura',
  CRIPTO_DEFI: 'Cripto - DeFi',
  CRIPTO_ESPECULATIVO: 'Cripto - Especulativo',
  FUNDO_RENDA_FIXA: 'Fundo - Renda Fixa',
  FUNDO_MULTIMERCADO: 'Fundo - Multimercado',
  FUNDO_ACOES: 'Fundo - Ações',
  FUNDO_CAMBIAL: 'Fundo - Cambial',
  FUNDO_FOF: 'Fundo - FOF',
  RF_POS_FIXADO: 'RF - Pós-fixado',
  RF_IPCA: 'RF - IPCA',
  RF_PREFIXADO: 'RF - Prefixado',
  RF_TESOURO: 'RF - Tesouro',
};

export type Currency = 'BRL' | 'USD' | 'EUR';

// Compatibilidade: alias para evitar quebra de imports
export type AssetClass = ClasseAtivo;
export const ASSET_CLASS_LABELS = CLASSE_ATIVO_LABELS;
export const ASSET_CLASS_COLORS = CLASSE_ATIVO_COLORS;
