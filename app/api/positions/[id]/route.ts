import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { requireAuth } from '@/lib/authGuard';

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
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['ADMIN', 'ADVISOR']);
  if (!auth.authorized) {
    return auth.response!;
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updatePosicaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const repo = getPortfolioRepository();
    const updated = await repo.updatePosicao(id, {
      ...parsed.data,
      dataEntrada: parsed.data.dataEntrada ? new Date(parsed.data.dataEntrada) : undefined,
      dataVencimento: parsed.data.dataVencimento ? new Date(parsed.data.dataVencimento) : undefined,
    });
    if (!updated) {
      return NextResponse.json({ error: 'Posição não encontrada' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['ADMIN', 'ADVISOR']);
  if (!auth.authorized) {
    return auth.response!;
  }

  const { id } = await params;
  try {
    const repo = getPortfolioRepository();
    await repo.deletePosicao(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}