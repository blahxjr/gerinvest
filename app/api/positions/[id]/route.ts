import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/authGuard';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import type { ClasseAtivo } from '@/core/domain/types';

const VALID_CLASSES: readonly ClasseAtivo[] = [
  'ACAO_BR', 'FII', 'ETF_BR', 'BDR', 'ACAO_EUA', 'ETF_EUA', 'REIT',
  'FUNDO', 'CRIPTO', 'RENDA_FIXA', 'POUPANCA', 'PREVIDENCIA', 'ALTERNATIVO',
] as const;

const patchSchema = z.object({
  ticker:       z.string().optional(),
  description:  z.string().optional(),
  assetClass:   z.string().optional(),
  institution:  z.string().optional(),
  account:      z.string().optional(),
  quantity:     z.number().finite().optional(),
  price:        z.number().finite().optional(),
  grossValue:   z.number().finite().optional(),
  indexer:      z.string().optional(),
  maturityDate: z.string().optional(),
  issuer:       z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const repo = getPortfolioRepository();
  const posicao = await repo.getPosicaoById(id);
  if (!posicao) {
    return NextResponse.json({ error: 'Posição não encontrada' }, { status: 404 });
  }

  const data = parsed.data;

  // ── Atualizar campos da tabela `posicoes` ──────────────────────────────
  const posicaoUpdate: Parameters<typeof repo.updatePosicao>[1] = {};
  if (data.quantity   !== undefined) posicaoUpdate.quantidade     = data.quantity;
  if (data.price      !== undefined) posicaoUpdate.precoMedio     = data.price;
  if (data.grossValue !== undefined) {
    posicaoUpdate.valorAtualBruto = data.grossValue;
    posicaoUpdate.valorAtualBrl   = data.grossValue;
  }
  if (data.institution !== undefined) posicaoUpdate.instituicao   = data.institution;
  if (data.account     !== undefined) posicaoUpdate.conta         = data.account;
  if (data.maturityDate && data.maturityDate !== '') {
    posicaoUpdate.dataVencimento = new Date(data.maturityDate);
  }

  if (Object.keys(posicaoUpdate).length > 0) {
    await repo.updatePosicao(id, posicaoUpdate);
  }

  // ── Atualizar campos da tabela `ativos` ────────────────────────────────
  const ativoUpdate: Parameters<typeof repo.updateAtivo>[1] = {};
  if (data.ticker      !== undefined) ativoUpdate.ticker    = data.ticker;
  if (data.description !== undefined) ativoUpdate.nome      = data.description;
  if (data.indexer     !== undefined) ativoUpdate.indexador = data.indexer;
  if (data.assetClass  !== undefined) {
    ativoUpdate.classe = VALID_CLASSES.includes(data.assetClass as ClasseAtivo)
      ? (data.assetClass as ClasseAtivo)
      : 'ALTERNATIVO';
  }
  if (data.issuer !== undefined) {
    ativoUpdate.metadata = { issuer: data.issuer };
  }

  if (Object.keys(ativoUpdate).length > 0) {
    await repo.updateAtivo(posicao.ativoId, ativoUpdate);
  }

  revalidatePath('/');
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  const repo = getPortfolioRepository();

  const posicao = await repo.getPosicaoById(id);
  if (!posicao) {
    return NextResponse.json({ error: 'Posição não encontrada' }, { status: 404 });
  }

  await repo.deletePosicao(id);
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}