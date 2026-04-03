/**
 * API Route: GET and POST /api/posicoes
 * Integra com PostgresPortfolioRepository (Tarefa E)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { CreatePosicaoInput } from '@/core/domain/entities';

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
    const body = await req.json();
    const input: CreatePosicaoInput = {
      carteiraId: body.carteiraId,
      ativoId: body.ativoId,
      quantidade: body.quantidade,
      precoMedio: body.precoMedio,
      valorAtualBruto: body.valorAtualBruto,
      valorAtualBrl: body.valorAtualBrl,
      moedaOriginal: body.moedaOriginal || 'BRL',
      instituicao: body.instituicao,
      conta: body.conta,
      custodia: body.custodia,
      dataEntrada: body.dataEntrada,
      dataVencimento: body.dataVencimento,
    };

    if (!input.carteiraId || !input.ativoId || input.valorAtualBrl === undefined) {
      return NextResponse.json(
        { error: 'Campos "carteiraId", "ativoId" e "valorAtualBrl" são obrigatórios' },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const posicao = await repo.createPosicao(input);
    return NextResponse.json(posicao, { status: 201 });
  } catch (error) {
    console.error('POST /api/posicoes error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar posição' },
      { status: 500 }
    );
  }
}
