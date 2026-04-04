/**
 * API Route: GET and POST /api/ativos
 * Integra com PostgresPortfolioRepository (Tarefa E)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { ClasseAtivo, SubclasseAtivo } from '@/core/domain/types';
import { CreateAtivoInput } from '@/core/domain/entities';

const CLASSE_ATIVO_VALUES = [
  'ACAO_BR', 'FII', 'ETF_BR', 'BDR', 'ACAO_EUA', 'ETF_EUA',
  'REIT', 'FUNDO', 'CRIPTO', 'RENDA_FIXA', 'POUPANCA', 'PREVIDENCIA', 'ALTERNATIVO',
] as const;

const createAtivoSchema = z.object({
  ticker: z.string().max(20).optional(),
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  classe: z.enum(CLASSE_ATIVO_VALUES, { message: 'Classe de ativo inválida' }),
  subclasse: z.string().max(50).optional(),
  pais: z.string().max(3).optional(),
  moeda: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  setor: z.string().max(100).optional(),
  segmento: z.string().max(100).optional(),
  benchmark: z.string().max(50).optional(),
  indexador: z.string().max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classe = searchParams.get('classe') as ClasseAtivo | null;

    const repo = getPortfolioRepository();
    let ativos;

    if (classe) {
      ativos = await repo.getAtivosByClasse(classe);
    } else {
      ativos = await repo.getAllAtivos();
    }

    return NextResponse.json(ativos, { status: 200 });
  } catch (error) {
    console.error('GET /api/ativos error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ativos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createAtivoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const input: CreateAtivoInput = {
      ...parsed.data,
      subclasse: parsed.data.subclasse as SubclasseAtivo | undefined,
    };
    const ativo = await repo.createAtivo(input);
    return NextResponse.json(ativo, { status: 201 });
  } catch (error) {
    console.error('POST /api/ativos error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar ativo' },
      { status: 500 }
    );
  }
}