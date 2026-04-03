/**
 * API Route: GET and POST /api/ativos
 * Integra com PostgresPortfolioRepository (Tarefa E)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { CreateAtivoInput } from '@/core/domain/entities';
import { ClasseAtivo } from '@/core/domain/types';

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
    const body = await req.json();
    const input: CreateAtivoInput = {
      ticker: body.ticker,
      nome: body.nome,
      classe: body.classe,
      subclasse: body.subclasse,
      pais: body.pais,
      moeda: body.moeda,
      setor: body.setor,
      segmento: body.segmento,
      benchmark: body.benchmark,
      indexador: body.indexador,
      metadata: body.metadata,
    };

    if (!input.nome || !input.classe) {
      return NextResponse.json(
        { error: 'Campos "nome" e "classe" são obrigatórios' },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
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