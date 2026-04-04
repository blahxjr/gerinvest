import { NextRequest, NextResponse } from 'next/server';
import { proventoSchema } from '@/core/domain/provento';
import {
  listarProventos,
  criarProvento,
} from '@/core/services/proventosService';
import { requireAuth } from '@/lib/authGuard';

export async function GET(req: NextRequest) {
  const guard = await requireAuth(req);
  if (!guard.authorized) return guard.response!;

  const { searchParams } = new URL(req.url);
  const carteiraId = searchParams.get('carteiraId') ?? undefined;

  try {
    const proventos = await listarProventos(carteiraId);
    return NextResponse.json(proventos);
  } catch {
    return NextResponse.json({ error: 'Erro ao listar proventos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth(req);
  if (!guard.authorized) return guard.response!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = proventoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const provento = await criarProvento(parsed.data);
    return NextResponse.json(provento, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar provento' }, { status: 500 });
  }
}
