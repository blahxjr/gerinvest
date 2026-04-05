/**
 * API Route: GET and POST /api/carteiras
 * Integra com PostgresPortfolioRepository
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { CreateCarteiraInput } from '@/core/domain/entities';

export async function GET() {
  try {
    const repo = getPortfolioRepository();
    const carteiras = await repo.getAllCarteiras();
    return NextResponse.json(carteiras, { status: 200 });
  } catch (error) {
    console.error('GET /api/carteiras error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar carteiras' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: CreateCarteiraInput = {
      nome: body.nome,
      descricao: body.descricao,
      perfil: body.perfil,
      moedaBase: body.moedaBase || 'BRL',
      clienteId: body.clienteId,
      contaReferenciaId: body.contaReferenciaId,
    };

    if (!input.nome) {
      return NextResponse.json(
        { error: 'Campo "nome" é obrigatório' },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const carteira = await repo.createCarteira(input);
    return NextResponse.json(carteira, { status: 201 });
  } catch (error) {
    console.error('POST /api/carteiras error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar carteira' },
      { status: 500 }
    );
  }
}
