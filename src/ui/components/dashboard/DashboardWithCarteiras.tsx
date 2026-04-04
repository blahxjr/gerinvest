'use client';

import { useState, useMemo } from 'react';
import CarteiraSelector from './CarteiraSelector';
import PortfolioOverview from './PortfolioOverview';
import AllocationCharts from './AllocationCharts';
import DistributionCharts from './DistributionCharts';
import PositionsTable from './PositionsTable';
import { Position } from '@/core/domain/position';
import { AllocationEntry } from '@/core/domain/portfolio';
import {
  getAllocationByAssetClass,
  getAllocationByInstitution,
  getTopPositions,
  getConcentrationMetrics,
  getFixedVsVariableRatio,
} from '@/core/services/portfolioService';

type CarteiraInfo = {
  id: string;
  nome: string;
  descricao?: string;
  posicoes: Position[];
};

type Props = {
  carteiras: CarteiraInfo[];
  allPositions: Position[];
};

export default function DashboardWithCarteiras({ carteiras, allPositions }: Props) {
  const [selectedCarteiraId, setSelectedCarteiraId] = useState<string | null>(null);
  const [highlightedTicker, setHighlightedTicker] = useState<string | null>(null);

  // Filtrar posições baseado em carteira selecionada
  const positions = useMemo(() => {
    if (!selectedCarteiraId) return allPositions;
    const carteira = carteiras.find(c => c.id === selectedCarteiraId);
    return carteira?.posicoes || [];
  }, [selectedCarteiraId, carteiras, allPositions]);

  // Recalcular métricas baseado na carteira selecionada
  const allocationByAssetClass = useMemo(() => getAllocationByAssetClass(positions), [positions]);
  const allocationByInstitution = useMemo(() => getAllocationByInstitution(positions), [positions]);
  const topPositions = useMemo(() => getTopPositions(positions, 20), [positions]);
  const concentration = useMemo(() => getConcentrationMetrics(positions), [positions]);
  const fixedVsVariable = useMemo(() => getFixedVsVariableRatio(positions), [positions]);

  // Calcs para summary
  const totalInvested = useMemo(
    () => positions.reduce((sum: number, p: any) => sum + (p.valorAtualBrl || p.grossValue || 0), 0),
    [positions]
  );

  const summary = useMemo(() => ({
    totalInvested,
    totalPositions: positions.length,
    uniqueTickers: new Set(positions.map((p: any) => p.ticker).filter(Boolean)).size,
    uniqueAccounts: 0,
    uniqueInstitutions: new Set(positions.map((p: any) => p.instituicao || p.institution || 'Outros')).size,
  }), [positions, totalInvested]);

  const sortedAssetClass = [...allocationByAssetClass].sort((a, b) => b.percentage - a.percentage);
  const topAssetClass = sortedAssetClass[0];
  const topInstitution = [...allocationByInstitution].sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <div>
      {/* Seletor de Carteira */}
      <CarteiraSelector
        carteiras={carteiras}
        selectedCarteiraId={selectedCarteiraId}
        onSelectCarteira={setSelectedCarteiraId}
      />

      {/* KPIs */}
      <PortfolioOverview summary={summary} positions={positions} />

      {/* Gráficos de Alocação */}
      <AllocationCharts assetClass={allocationByAssetClass} institution={allocationByInstitution} />

      {/* Gráficos de Distribuição */}
      <DistributionCharts positions={positions} topPositions={topPositions} fixedVsVariable={fixedVsVariable} />

      {/* Insights Dinâmicos */}
      <section className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-800/50 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-4">📈 Insights da Carteira</h3>
        
        {positions.length === 0 ? (
          <p className="text-slate-400 italic">Selecione uma carteira ou importe posições para ver insights.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insight 1: Maior classe de ativo */}
            {topAssetClass && (
              <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
                <p className="text-xs text-slate-400 mb-1">🎯 Maior Alocação por Classe</p>
                <p className="text-sm text-slate-100">
                  <strong className="text-emerald-400">{topAssetClass.classe}</strong> concentra{' '}
                  <strong className="text-emerald-300">{topAssetClass.percentage.toFixed(2)}%</strong> da carteira
                  {totalInvested > 0 && (
                    <span className="text-slate-400 ml-2">
                      ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        (topAssetClass.percentage / 100) * totalInvested
                      )})
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Insight 2: Maior instituição */}
            {topInstitution && (
              <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
                <p className="text-xs text-slate-400 mb-1">🏢 Maior Concentração por Instituição</p>
                <p className="text-sm text-slate-100">
                  <strong className="text-blue-400">{topInstitution.institution}</strong> com{' '}
                  <strong className="text-blue-300">{topInstitution.percentage.toFixed(2)}%</strong> dos recursos
                  {totalInvested > 0 && (
                    <span className="text-slate-400 ml-2">
                      ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        (topInstitution.percentage / 100) * totalInvested
                      )})
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Insight 3: Diversificação */}
            <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
              <p className="text-xs text-slate-400 mb-1">🌈 Diversificação</p>
              <p className="text-sm text-slate-100">
                <strong className="text-purple-400">{summary.uniqueTickers}</strong> ativos únicos em{' '}
                <strong className="text-purple-300">{summary.uniqueInstitutions}</strong> instituições
              </p>
            </div>

            {/* Insight 4: Renda Fixa vs Variável */}
            <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
              <p className="text-xs text-slate-400 mb-1">⚖️ Renda Fixa vs Variável</p>
              <p className="text-sm text-slate-100">
                <strong className="text-orange-400">{fixedVsVariable.percentualFixa.toFixed(1)}%</strong> Renda Fixa{' '}
                <span className="text-slate-500">•</span> <strong className="text-red-400">{fixedVsVariable.percentualVariavel.toFixed(1)}%</strong> Renda Variável
              </p>
            </div>

            {/* Insight 5: Concentração */}
            {concentration && concentration.largestPosition && (
              <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
                <p className="text-xs text-slate-400 mb-1">📊 Maior Posição</p>
                <p className="text-sm text-slate-100">
                  <strong>{concentration.largestPosition.ticker}</strong> com{' '}
                  <strong className={concentration.largestPosition.percentualDaCarteira > 20 ? 'text-red-400' : 'text-green-400'}>
                    {concentration.largestPosition.percentualDaCarteira.toFixed(2)}%
                  </strong>{' '}
                  {concentration.largestPosition.percentualDaCarteira > 20 && '⚠️ Concentrado'}
                </p>
              </div>
            )}

            {/* Insight 6: Total Investido */}
            <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
              <p className="text-xs text-slate-400 mb-1">💰 Patrimônio Total</p>
              <p className="text-sm text-slate-100 font-semibold text-sky-300">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Tabela de Posições com Realce Interativo */}
      <PositionsTable 
        positions={positions}
        highlightedTicker={highlightedTicker}
        onHighlightTicker={setHighlightedTicker}
      />
    </div>
  );
}
