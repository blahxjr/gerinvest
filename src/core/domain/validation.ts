import { z } from 'zod';
import { ClasseAtivo, SubclasseAtivo } from './types';
import { Position } from './position';

/**
 * Schema de validação para posição (multiativo)
 * Alinhado com docs/ai/06-business-rules.md
 */
export const positionSchema = z.object({
  id: z.string().min(1),
  classe: z.enum(['ACAO_BR', 'FII', 'ETF_BR', 'BDR', 'ACAO_EUA', 'ETF_EUA', 'REIT', 'FUNDO', 'CRIPTO', 'RENDA_FIXA', 'POUPANCA', 'PREVIDENCIA', 'ALTERNATIVO']),
  subclasse: z.string().optional(),
  ticker: z.string().optional(),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  instituicao: z.string().optional(),
  conta: z.string().optional(),
  custodia: z.string().optional(),
  quantidade: z.number().nonnegative().optional(),
  precoMedio: z.number().nonnegative().optional(),
  valorAtualBruto: z.number().nonnegative().optional(),
  valorAtualBrl: z.number().nonnegative(),
  moedaOriginal: z.enum(['BRL', 'USD', 'EUR']),
  dataEntrada: z.string().optional(),
  dataVencimento: z.string().optional(),
  benchmark: z.string().optional(),
  // Compatibilidade com schema antigo
  assetClass: z.enum(['ACAO_BR', 'FII', 'ETF_BR', 'BDR', 'ACAO_EUA', 'ETF_EUA', 'REIT', 'FUNDO', 'CRIPTO', 'RENDA_FIXA', 'POUPANCA', 'PREVIDENCIA', 'ALTERNATIVO']).optional(),
  description: z.string().optional(),
  institution: z.string().optional(),
  account: z.string().optional(),
  quantity: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  grossValue: z.number().nonnegative().optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).optional(),
  indexer: z.string().optional(),
  maturityDate: z.string().optional(),
  issuer: z.string().optional(),
});

export type PositionSchema = z.infer<typeof positionSchema>;

/**
 * Schema para resultado de importação
 */
export const importResultSchema = z.object({
  positions: z.array(positionSchema),
  totals: z.object({ 
    totalCount: z.number().nonnegative(), 
    totalValue: z.number().nonnegative() 
  }),
  perAssetClass: z.array(
    z.object({
      classe: z.string(),
      importedCount: z.number().nonnegative(),
      importedValue: z.number().nonnegative(),
      errors: z.array(z.object({ row: z.number().nonnegative(), message: z.string() })),
    })
  ),
});

/**
 * Validar posição contra schema
 * Retorna sucesso ou lista de erros
 */
export function validatePosition(position: unknown): { valid: true; position: Position } | { valid: false; errors: string[] } {
  const result = positionSchema.safeParse(position);
  if (result.success) {
    return { valid: true, position: result.data as Position };
  }

  const validationErrors = result.error?.issues?.map((err) => `${err.path.join('.')} ${err.message}`) ?? ['Validação inválida'];
  return { valid: false, errors: validationErrors };
}

/**
 * Validar subclasse para uma classe de ativo
 * Retorna true se subclasse é válida para a classe
 */
export function isValidSubclasse(classe: ClasseAtivo, subclasse: string): boolean {
  const validSubclasses: Record<ClasseAtivo, string[]> = {
    FII: ['FII_TIJOLO', 'FII_PAPEL', 'FII_FOF', 'FII_DESENVOLVIMENTO'],
    CRIPTO: ['CRIPTO_BASE', 'CRIPTO_INFRAESTRUTURA', 'CRIPTO_DEFI', 'CRIPTO_ESPECULATIVO'],
    FUNDO: ['FUNDO_RENDA_FIXA', 'FUNDO_MULTIMERCADO', 'FUNDO_ACOES', 'FUNDO_CAMBIAL', 'FUNDO_FOF'],
    RENDA_FIXA: ['RF_POS_FIXADO', 'RF_IPCA', 'RF_PREFIXADO', 'RF_TESOURO'],
    ACAO_BR: [],
    ETF_BR: [],
    BDR: [],
    ACAO_EUA: [],
    ETF_EUA: [],
    REIT: [],
    POUPANCA: [],
    PREVIDENCIA: [],
    ALTERNATIVO: [],
  };

  const allowed = validSubclasses[classe];
  return allowed ? allowed.includes(subclasse) : false;
}
