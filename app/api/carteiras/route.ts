/**
 * API Route: GET and POST /api/carteiras
 * Integra com PostgresPortfolioRepository
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';

const createCarteiraSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  descricao: z.string().max(500).optional(),
  perfil: z.enum(['conservador', 'moderado', 'arrojado']).optional(),
  moedaBase: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
});

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
    const body = await req.json().catch(() => null);
    const parsed = createCarteiraSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const repo = getPortfolioRepository();
    const carteira = await repo.createCarteira(parsed.data);
    return NextResponse.json(carteira, { status: 201 });
  } catch (error) {
    console.error('POST /api/carteiras error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar carteira' },
      { status: 500 }
    );
  }
}
