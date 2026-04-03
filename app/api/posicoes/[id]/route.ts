/**
 * API Route: GET, PATCH, DELETE /api/posicoes/[id]
 * Integra com PostgresPortfolioRepository (Tarefa E)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { CreatePosicaoInput } from '@/core/domain/entities';

type Params = { params: Promise<{ id: string }> };

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
    const body = await req.json();
    const input: Partial<CreatePosicaoInput> = {
      quantidade: body.quantidade,
      precoMedio: body.precoMedio,
      valorAtualBruto: body.valorAtualBruto,
      valorAtualBrl: body.valorAtualBrl,
      moedaOriginal: body.moedaOriginal,
      instituicao: body.instituicao,
      conta: body.conta,
      custodia: body.custodia,
      dataEntrada: body.dataEntrada,
      dataVencimento: body.dataVencimento,
    };

    const repo = getPortfolioRepository();
    const posicao = await repo.updatePosicao(id, input);
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
