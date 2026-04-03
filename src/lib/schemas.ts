import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  documento: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
});

export const instituicaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  tipo: z.string().optional().nullable(),
});

export const tipoInvestimentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional().nullable(),
});

export const contaSchema = z.object({
  clienteId: z.string().uuid("Cliente inválido"),
  instituicaoId: z.string().uuid("Instituição inválida"),
  numeroConta: z.string().min(1, "Número da conta é obrigatório"),
  apelido: z.string().optional().nullable(),
});

export const ativoSchema = z.object({
  codigoNegociacao: z.string().min(1, "Código de negociação é obrigatório"),
  nomeProduto: z.string().min(1, "Nome do produto é obrigatório"),
  tipoPapel: z.string().optional().nullable(),
  emissor: z.string().optional().nullable(),
  tipoInvestimentoId: z.string().uuid().optional().nullable(),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
export type InstituicaoInput = z.infer<typeof instituicaoSchema>;
export type TipoInvestimentoInput = z.infer<typeof tipoInvestimentoSchema>;
export type ContaInput = z.infer<typeof contaSchema>;
export type AtivoInput = z.infer<typeof ativoSchema>;
