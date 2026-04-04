import PortfolioOverview from '@/ui/components/dashboard/PortfolioOverview';
import AllocationCharts from '@/ui/components/dashboard/AllocationCharts';
import DistributionCharts from '@/ui/components/dashboard/DistributionCharts';
import PositionsTable from '@/ui/components/dashboard/PositionsTable';
import DashboardClient from '@/ui/components/dashboard/DashboardClient';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import {
  getAllocationByAssetClass,
  getAllocationByInstitution,
  getTopPositions,
  getConcentrationMetrics,
  getFixedVsVariableRatio,
} from '@/core/services/portfolioService';
import { unstable_cache } from 'next/cache';

const getCachedPositions = unstable_cache(
  async () => {
    const repo = getPortfolioRepository();
    return repo.getAllPositions().catch(() => []);
  },
  ['portfolio-positions-sql'],
  { revalidate: 60 } // revalida a cada 60s
);

const getCachedSummary = unstable_cache(
  async () => {
    const repo = getPortfolioRepository();
    return repo.getSummary().catch(() => ({
      totalInvested: 0,
      totalPositions: 0,
      uniqueTickers: 0,
      uniqueAccounts: 0,
      uniqueInstitutions: 0,
    }));
  },
  ['portfolio-summary-sql'],
  { revalidate: 60 }
);

const getCachedLastImportDate = unstable_cache(
  async () => {
    const repo = getPortfolioRepository();
    return repo.getLastImportDate?.().catch(() => undefined);
  },
  ['portfolio-last-import-sql'],
  { revalidate: 60 }
);

export default async function Home() {
  const positions = await getCachedPositions();
  const summary = await getCachedSummary();
  const lastImportDate = await getCachedLastImportDate();

  const allocationByAssetClass = getAllocationByAssetClass(positions || []);
  const allocationByInstitution = getAllocationByInstitution(positions);
  const topPositions = getTopPositions(positions, 20);
  const concentration = getConcentrationMetrics(positions);
  const fixedVsVariable = getFixedVsVariableRatio(positions);

  const sortedAssetClass = [...allocationByAssetClass].sort((a, b) => b.percentage - a.percentage);
  const topAssetClass = sortedAssetClass[0];
  const topInstitution = allocationByInstitution[0];

  const data = {
    summary: { ...summary, lastImportDate },
    allocationByAssetClass,
    allocationByInstitution,
    topPositions,
    concentration,
    fixedVsVariable,
    positions,
  };

  return (
    <DashboardClient>
      <PortfolioOverview summary={data.summary} positions={data.positions} />

      <AllocationCharts assetClass={data.allocationByAssetClass} institution={data.allocationByInstitution} />

      <DistributionCharts positions={data.positions} topPositions={data.topPositions} fixedVsVariable={data.fixedVsVariable} />

      <section className="mb-6 rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-2">Insights rápidos</h3>
        <ul className="text-slate-200 list-disc list-inside space-y-1">
          <li>
            A classe com maior peso é <strong>{topAssetClass?.classe ?? 'N/A'}</strong> com{' '}
            <strong>{topAssetClass?.percentage.toFixed(2) ?? '0.00'}%</strong> da carteira.
          </li>
          <li>
            A instituição que mais concentra recursos é <strong>{topInstitution?.institution ?? 'N/A'}</strong> com{' '}
            <strong>{topInstitution?.percentage.toFixed(2) ?? '0.00'}%</strong>.
          </li>
          <li>
            Posição mais concentrada: <strong>{data.topPositions[0]?.ticker ?? 'N/A'}</strong> ({data.topPositions[0]?.grossValue?.toFixed(2) ?? '0.00'}).
          </li>
          <li>
            Carteira atual: <strong>{data.summary.totalPositions}</strong> posições; valor total{' '}
            <strong>{data.summary.totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>.
          </li>
        </ul>
      </section>

      <section className="mb-6 rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-2">Concentração de posições</h3>
        <p>Top 1: {data.concentration.top1Percentage.toFixed(2)}%</p>
        <p>Top 3: {data.concentration.top3Percentage.toFixed(2)}%</p>
        <p>Top 5: {data.concentration.top5Percentage.toFixed(2)}%</p>
        <p>
          Renda fixa: {data.fixedVsVariable.fixedPercentage.toFixed(2)}% | Renda variável: {data.fixedVsVariable.variablePercentage.toFixed(2)}%
        </p>
      </section>

      <PositionsTable positions={data.positions} />
    </DashboardClient>
  );
}