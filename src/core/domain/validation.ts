import { z } from 'zod';
import { AssetClass } from './types';
import { Position } from './position';

export const positionSchema = z.object({
  id: z.string().min(1),
  assetClass: z.enum(['ACOES', 'BDR', 'ETF', 'FII', 'FIAGRO', 'RENDA_FIXA', 'TESOURO_DIRETO']),
  ticker: z.string().min(1),
  description: z.string().min(1),
  institution: z.string().min(1),
  account: z.string().min(1),
  quantity: z.number().nonnegative(),
  price: z.number().nonnegative(),
  grossValue: z.number().nonnegative(),
  currency: z.literal('BRL'),
  indexer: z.string().optional(),
  maturityDate: z.string().optional(),
  issuer: z.string().optional(),
});

export type PositionSchema = z.infer<typeof positionSchema>;

export const importResultSchema = z.object({
  positions: z.array(positionSchema),
  totals: z.object({ totalCount: z.number().nonnegative(), totalValue: z.number().nonnegative() }),
  perAssetClass: z.array(
    z.object({
      assetClass: z.enum(['ACOES', 'BDR', 'ETF', 'FII', 'FIAGRO', 'RENDA_FIXA', 'TESOURO_DIRETO']),
      importedCount: z.number().nonnegative(),
      importedValue: z.number().nonnegative(),
      errors: z.array(z.object({ row: z.number().nonnegative(), message: z.string() })),
    })
  ),
});

export function validatePosition(position: unknown): { valid: true; position: Position } | { valid: false; errors: string[] } {
  const result = positionSchema.safeParse(position);
  if (result.success) {
    return { valid: true, position: result.data as Position };
  }

  const validationErrors = result.error?.issues?.map((err) => `${err.path.join('.')} ${err.message}`) ?? ['Validação inválida'];
  return { valid: false, errors: validationErrors };
}
