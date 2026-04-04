import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authGuard';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import {
  getPortfolioSummary,
  getAllocationByAssetClass,
  getAllocationByInstitution,
  getTopPositions,
  getConcentrationMetrics,
  getFixedVsVariableRatio,
} from '@/core/services/portfolioService';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.authorized) {
    return auth.response!;
  }

  try {
    const repo = getPortfolioRepository();
    const positions = await repo.getAllPositionsEnriched();

    const summary = getPortfolioSummary(positions);
    const allocationByAssetClass = getAllocationByAssetClass(positions);
    const allocationByInstitution = getAllocationByInstitution(positions);
    const topPositions = getTopPositions(positions, 20);
    const concentration = getConcentrationMetrics(positions);
    const fixedVsVariable = getFixedVsVariableRatio(positions);

    return NextResponse.json({
      summary,
      allocationByAssetClass,
      allocationByInstitution,
      topPositions,
      concentration,
      fixedVsVariable,
      positions,
    });
  } catch (error) {
    console.error('dashboard-data falhou', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados do dashboard', details: (error as Error).message },
      { status: 500 }
    );
  }
}
