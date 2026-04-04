import { z } from 'zod';
import { ClasseAtivo } from './types';

export const TIPOS_PROVENTO = [
  'DIVIDENDO',
  'JCP',
  'RENDA_FII',
  'GCAP',
  'CUPOM',
  'AMORTIZACAO',
  'RENDIMENTO',
] as const;

export type TipoProvento = (typeof TIPOS_PROVENTO)[number];

export const TIPO_PROVENTO_LABELS: Record<TipoProvento, string> = {
  DIVIDENDO:    'Dividendo',
  JCP:          'Juros sobre Capital Próprio',
  RENDA_FII:    'Rendimento FII',
  GCAP:         'Ganho de Capital',
  CUPOM:        'Cupom (Renda Fixa)',
  AMORTIZACAO:  'Amortização',
  RENDIMENTO:   'Rendimento',
};

export interface Provento {
  id: string;
  posicaoId?: string | null;
  carteiraId?: string | null;
  tipo: TipoProvento;
  ticker?: string | null;
  descricao?: string | null;
  valorBruto: number;
  irRetido: number;
  valorLiquido: number;       // gerado: valorBruto - irRetido
  impostoIncidente: number;   // IR adicional a recolher (DARF)
  dataCom?: string | null;    // YYYY-MM-DD
  dataPagamento: string;      // YYYY-MM-DD
  competencia?: string | null; // YYYY-MM
  observacao?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

// ------------------------------------------------------------------
// Zod
// ------------------------------------------------------------------

export const proventoSchema = z.object({
  posicaoId:         z.string().uuid().nullable().optional(),
  carteiraId:        z.string().uuid().nullable().optional(),
  tipo:              z.enum(TIPOS_PROVENTO),
  ticker:            z.string().max(20).nullable().optional(),
  descricao:         z.string().max(200).nullable().optional(),
  valorBruto:        z.number().nonnegative(),
  irRetido:          z.number().nonnegative(),
  impostoIncidente:  z.number().nonnegative(),
  dataCom:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  dataPagamento:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  competencia:       z.string().regex(/^\d{4}-\d{2}$/).nullable().optional(),
  observacao:        z.string().max(500).nullable().optional(),
});

export type ProventoInput = z.infer<typeof proventoSchema>;

// ------------------------------------------------------------------
// Proventos agrupados por período para relatório de IR
// ------------------------------------------------------------------

export interface ResumoIRMensal {
  competencia: string; // YYYY-MM
  dividendos: number;
  jcp: number;
  rendimentoFII: number;
  gcapBruto: number;
  gcapIsento: number;  // Vendas em ações <= 20k/mês (isenção)
  gcapTributavel: number;
  irRetidoFonte: number;
  irARecolher: number; // DARF a pagar
  baseCalculo: ClasseAtivo[];
}
