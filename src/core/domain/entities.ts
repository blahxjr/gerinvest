/**
 * Entidades do banco de dados multiativo
 * Alinhados com migrations/004_multiativo_schema.sql
 */

import { ClasseAtivo, SubclasseAtivo, Currency } from './types';

// Re-export tipos para conveniência
export type { ClasseAtivo, SubclasseAtivo, Currency };

/**
 * Carteira: agrupa posições por estratégia/perfil
 */
export type Carteira = {
  id: string; // UUID
  nome: string;
  descricao?: string;
  perfil?: 'conservador' | 'moderado' | 'arrojado';
  moedaBase: Currency;
  criadoEm: Date;
  atualizadoEm: Date;
};

/**
 * Ativo: entidade única que pode estar em múltiplas carteiras/posições
 * Classifica ativos em 13 classes com subclasses opcionais
 */
export type Ativo = {
  id: string; // UUID
  ticker?: string;
  nome: string;
  classe: ClasseAtivo;
  subclasse?: SubclasseAtivo;
  pais?: string; // ISO 3166-1 alpha-3: BRA, USA, CHN, etc.
  moeda: Currency;
  setor?: string; // Para ações, FIIs: Petróleo, Tecnologia, etc.
  segmento?: string; // Para FIIs: Logístico, Varejo, Shopping, etc.
  benchmark?: string; // Para fundos: IBOV, S&P 500, etc.
  indexador?: string; // Para renda fixa: IPCA, SELIC, etc.
  metadata?: Record<string, unknown>; // Campos dinâmicos por classe
  criadoEm: Date;
  atualizadoEm: Date;
};

/**
 * Posição: holding do investidor em um ativo dentro de uma carteira
 * Alinha com docs/ai/05-data-models.md::PosicaoInvestimento
 */
export type PosicaoDB = {
  id: string; // UUID
  carteiraId: string; // FK → carteiras.id
  ativoId: string; // FK → ativos.id
  quantidade?: number;
  precoMedio?: number;
  valorAtualBruto?: number;
  valorAtualBrl: number; // Obrigatório, consolidado em BRL (Regra 2)
  moedaOriginal: Currency; // Preservar moeda original (Regra 3)
  instituicao?: string;
  conta?: string;
  custodia?: string; // Para criptos: exchange, hardware wallet, etc.
  dataEntrada?: Date;
  dataVencimento?: Date;
  atualizadoEm: Date;
};

/**
 * Auditoria de posições: rastrear histórico de mudanças
 */
export type PosicaoAudit = {
  id: number; // BIGSERIAL
  posicaoId: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  dadosAntigos?: Record<string, unknown>;
  dadosNovos?: Record<string, unknown>;
  usuario?: string;
  criadoEm: Date;
};

/**
 * DTO para criar/atualizar Carteira
 */
export type CreateCarteiraInput = Omit<Carteira, 'id' | 'criadoEm' | 'atualizadoEm'>;

/**
 * DTO para criar/atualizar Ativo
 */
export type CreateAtivoInput = Omit<Ativo, 'id' | 'criadoEm' | 'atualizadoEm'>;

/**
 * DTO para criar/atualizar Posição
 */
export type CreatePosicaoInput = Omit<PosicaoDB, 'id' | 'atualizadoEm'>;

/**
 * View: Resumo de carteira com consolidações
 * Usada por análises (diversificationService, etc.)
 */
export type CarteiraResumo = {
  carteiraId: string;
  carteiraNome: string;
  moedaBase: Currency;
  totalBrl: number;
  posicoesCont: number;
  diversificationScore: number;
};

/**
 * View: Distribuição por classe de ativo
 * Entrada para dashboards de alocação
 */
export type AlocacaoPorClasse = {
  classe: ClasseAtivo;
  totalBrl: number;
  percentual: number;
  posicoesCont: number;
};

/**
 * View: Exposição cambial de carteira
 * Entrada para análise diversificationService
 */
export type ExposicaoCambial = {
  carteiraId: string;
  brl: number;
  usd: number;
  eur: number;
  other: number;
  brlPct: number;
  usdPct: number;
  eurPct: number;
  otherPct: number;
};
