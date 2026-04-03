/**
 * API Route: GET, PATCH, DELETE /api/carteiras/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { CreateCarteiraInput } from '@/core/domain/entities';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const repo = getPortfolioRepository();
    const carteira = await repo.getCarteiraById(id);
    if (!carteira) {
      return NextResponse.json(
        { error: 'Carteira não encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(carteira, { status: 200 });
  } catch (error) {
    console.error(`GET /api/carteiras/[${id}] error:`, error);
    return NextResponse.json(
      { error: 'Erro ao buscar carteira' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await req.json();
    const input: Partial<CreateCarteiraInput> = {
      nome: body.nome,
      descricao: body.descricao,
      perfil: body.perfil,
      moedaBase: body.moedaBase,
    };

    const repo = getPortfolioRepository();
    const carteira = await repo.updateCarteira(id, input);
    return NextResponse.json(carteira, { status: 200 });
  } catch (error) {
    console.error(`PATCH /api/carteiras/[${id}] error:`, error);
    return NextResponse.json(
      { error: 'Erro ao atualizar carteira' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const repo = getPortfolioRepository();
    await repo.deleteCarteira(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/carteiras/[${id}] error:`, error);
    return NextResponse.json(
      { error: 'Erro ao deletar carteira' },
      { status: 500 }
    );
  }
}
