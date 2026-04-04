/**
 * API Route: GET, PATCH, DELETE /api/posicoes/[id]
 * Integra com PostgresPortfolioRepository (Tarefa E)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';

type Params = { params: Promise<{ id: string }> };

const updatePosicaoSchema = z.object({
  quantidade: z.number().nonnegative().optional(),
  precoMedio: z.number().nonnegative().optional(),
  valorAtualBruto: z.number().nonnegative().optional(),
  valorAtualBrl: z.number().nonnegative().optional(),
  moedaOriginal: z.enum(['BRL', 'USD', 'EUR']).optional(),
  instituicao: z.string().max(100).optional(),
  conta: z.string().max(100).optional(),
  custodia: z.string().max(100).optional(),
  dataEntrada: z.string().optional(),
  dataVencimento: z.string().optional(),
}).refine(
  (obj) => Object.values(obj).some((v) => v !== undefined),
  { message: 'Ao menos um campo deve ser fornecido para atualização' }
);

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const repo = getPortfolioRepository();
    const posicao = await repo.getPosicaoById(id);
    if (!posicao) {
      return NextResponse.json(
        { error: 'Posição não encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(posicao, { status: 200 });
  } catch (error) {
    console.error(`GET /api/posicoes/[${id}] error:`, error);
    return NextResponse.json(
      { error: 'Erro ao buscar posição' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => null);
    const parsed = updatePosicaoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const posicao = await repo.updatePosicao(id, parsed.data);
    if (!posicao) {
      return NextResponse.json({ error: 'Posição não encontrada' }, { status: 404 });
    }
    return NextResponse.json(posicao, { status: 200 });
  } catch (error) {
    console.error(`PATCH /api/posicoes/[${id}] error:`, error);
    return NextResponse.json(
      { error: 'Erro ao atualizar posição' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const repo = getPortfolioRepository();
    await repo.deletePosicao(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/posicoes/[${id}] error:`, error);
    return NextResponse.json(
      { error: 'Erro ao deletar posição' },
      { status: 500 }
    );
  }
}
