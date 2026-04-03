import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeDiversification,
  analyzeFiis,
  analyzeCrypto,
  analyzeFixedIncome,
  analyzeFunds,
} from '@/core/services';
import { CsvPortfolioRepository } from '@/infra/repositories/csvPortfolioRepository';

type AnalysisType = 'diversification' | 'fiis' | 'crypto' | 'fixedIncome' | 'funds' | 'all';

export async function POST(req: NextRequest) {
  try {
    const { analysisType } = (await req.json()) as { analysisType?: AnalysisType };
    const queryType = analysisType || 'all';

    const repo = new CsvPortfolioRepository();
    const positions = await repo.getAllPositions();

    if (positions.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma posição encontrada para análise' },
        { status: 400 }
      );
    }

    const results: Record<string, unknown> = {};

    if (queryType === 'all' || queryType === 'diversification') {
      results.diversification = analyzeDiversification(positions);
    }

    if (queryType === 'all' || queryType === 'fiis') {
      results.fiis = analyzeFiis(positions);
    }

    if (queryType === 'all' || queryType === 'crypto') {
      results.crypto = analyzeCrypto(positions);
    }

    if (queryType === 'all' || queryType === 'fixedIncome') {
      results.fixedIncome = analyzeFixedIncome(positions);
    }

    if (queryType === 'all' || queryType === 'funds') {
      results.funds = analyzeFunds(positions);
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Erro ao executar análises:', error);
    return NextResponse.json(
      { error: `Erro ao executar análises: ${String(error)}` },
      { status: 500 }
    );
  }
}
