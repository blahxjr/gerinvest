/**
 * API Route: GET and POST /api/posicoes
 * Integra com PostgresPortfolioRepository (Tarefa E)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';

const createPosicaoSchema = z.object({
  carteiraId: z.string().uuid('carteiraId deve ser um UUID válido'),
  ativoId: z.string().uuid('ativoId deve ser um UUID válido'),
  quantidade: z.number().nonnegative().optional(),
  precoMedio: z.number().nonnegative().optional(),
  valorAtualBruto: z.number().nonnegative().optional(),
  valorAtualBrl: z.number().nonnegative('valorAtualBrl é obrigatório e deve ser ≥ 0'),
  moedaOriginal: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  instituicao: z.string().max(100).optional(),
  conta: z.string().max(100).optional(),
  custodia: z.string().max(100).optional(),
  dataEntrada: z.string().optional(),
  dataVencimento: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const carteiraId = searchParams.get('carteiraId');

    if (!carteiraId) {
      return NextResponse.json(
        { error: 'Parâmetro carteiraId é obrigatório' },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const posicoes = await repo.getPosicoesByCarteira(carteiraId);
    return NextResponse.json(posicoes, { status: 200 });
  } catch (error) {
    console.error('GET /api/posicoes error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar posições' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = createPosicaoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const posicao = await repo.createPosicao({
      ...parsed.data,
      dataEntrada: parsed.data.dataEntrada ? new Date(parsed.data.dataEntrada) : undefined,
      dataVencimento: parsed.data.dataVencimento ? new Date(parsed.data.dataVencimento) : undefined,
    });
    return NextResponse.json(posicao, { status: 201 });
  } catch (error) {
    console.error('POST /api/posicoes error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar posição' },
      { status: 500 }
    );
  }
}
