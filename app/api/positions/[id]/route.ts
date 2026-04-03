import { NextRequest, NextResponse } from 'next/server';
import { CsvPortfolioRepository } from '@/infra/repositories/csvPortfolioRepository';
import { requireAuth } from '@/lib/authGuard';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['ADMIN', 'ADVISOR']);
  if (!auth.authorized) {
    return auth.response!;
  }

  const { id } = await params;
  const body = await req.json();
  const repo = new CsvPortfolioRepository();
  
  try {
    const updated = await repo.updatePosition(id, body);
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
  const repo = new CsvPortfolioRepository();
  await repo.deletePosition(id);
  return NextResponse.json({ ok: true });
}