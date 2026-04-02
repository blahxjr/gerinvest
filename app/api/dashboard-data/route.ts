import { NextResponse } from 'next/server';
import { CsvPortfolioRepository } from '@/infra/repositories/csvPortfolioRepository';
import {
  getPortfolioSummary,
  getAllocationByAssetClass,
  getAllocationByInstitution,
  getTopPositions,
  getConcentrationMetrics,
  getFixedVsVariableRatio,
} from '@/core/services/portfolioService';

export async function GET() {
  try {
    const repo = new CsvPortfolioRepository();
    const positions = await repo.getAllPositions();
    const summary = await repo.getSummary();
    const lastImportDate = await repo.getLastImportDate?.();

    const allocationByAssetClass = getAllocationByAssetClass(positions);
    const allocationByInstitution = getAllocationByInstitution(positions);
    const topPositions = getTopPositions(positions, 20);
    const concentration = getConcentrationMetrics(positions);
    const fixedVsVariable = getFixedVsVariableRatio(positions);

    return NextResponse.json({
      summary: { ...summary, lastImportDate },
      allocationByAssetClass,
      allocationByInstitution,
      topPositions,
      concentration,
      fixedVsVariable,
      positions,
    });
  } catch (error) {
    console.error('dashboard-data failed', error);
    return NextResponse.json({ error: 'Erro ao carregar dados do dashboard', details: (error as Error).message }, { status: 500 });
  }
}
