import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authGuard';
import { persistPositionsToPostgres } from '@/infra/repositories/postgresIngestionService';
import type { Position } from '@/core/domain/position';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, ['ADMIN', 'ADVISOR']);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await request.json();
    const positions: Position[] = body.positions;

    if (!Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma posição enviada para confirmação.' },
        { status: 400 }
      );
    }

    const persisted = await persistPositionsToPostgres(positions);

    return NextResponse.json({
      success: true,
      persisted,
    });
  } catch (error) {
    console.error('[confirm] Erro ao persistir posições:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
