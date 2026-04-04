import { NextRequest, NextResponse } from 'next/server';
import { proventoSchema } from '@/core/domain/provento';
import {
  buscarProvento,
  atualizarProvento,
  deletarProvento,
} from '@/core/services/proventosService';
import { requireAuth } from '@/lib/authGuard';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAuth(req);
  if (!guard.authorized) return guard.response!;

  const { id } = await params;
  const provento = await buscarProvento(id);
  if (!provento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(provento);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAuth(req);
  if (!guard.authorized) return guard.response!;

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = proventoSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const updated = await atualizarProvento(id, parsed.data);
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAuth(req);
  if (!guard.authorized) return guard.response!;

  const { id } = await params;
  try {
    await deletarProvento(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar provento' }, { status: 500 });
  }
}
