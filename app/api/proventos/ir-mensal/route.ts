import { NextRequest, NextResponse } from 'next/server';
import { apurarIRMensal } from '@/core/services/proventosService';
import { requireAuth } from '@/lib/authGuard';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (!guard.authorized) return guard.response!;

  const { searchParams } = new URL(req.url);
  const competencia = searchParams.get('competencia');

  if (!competencia || !/^\d{4}-\d{2}$/.test(competencia)) {
    return NextResponse.json(
      { error: 'Parâmetro competencia obrigatório no formato YYYY-MM' },
      { status: 400 },
    );
  }

  const carteiraId = searchParams.get('carteiraId') ?? undefined;

  try {
    const resumo = await apurarIRMensal(competencia, carteiraId);
    return NextResponse.json(resumo);
  } catch {
    return NextResponse.json({ error: 'Erro ao apurar IR' }, { status: 500 });
  }
}
