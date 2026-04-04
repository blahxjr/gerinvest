"use client";

import { PortfolioSummary } from '@/core/domain/portfolio';
import { Position } from '@/core/domain/position';
import type { MarkToMarketMetrics } from '@/core/services/portfolioService';
import { KpiCard } from '@/ui/components/KpiCard';
import { BarChart3, CircleDollarSign, Coins, Landmark, PieChart, TrendingUp, Wallet } from 'lucide-react';

type Props = { 
  summary: PortfolioSummary & { lastImportDate?: string };
  positions: Position[];
  markToMarket?: MarkToMarketMetrics;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatPercent = (value: number, decimals = 2) =>
  `${value.toFixed(decimals)}%`;

export default function PortfolioOverview({ summary, positions, markToMarket }: Props) {
  const getValue = (p: Position): number => p.valorAtualBrl ?? p.grossValue ?? 0;
  const totalValue = positions.reduce((sum, p) => sum + getValue(p), 0);
  const topPosition = positions.reduce((top, p) => getValue(p) > getValue(top) ? p : top, positions[0]);
  const diversification = new Set(positions.map(p => p.assetClass || p.classe)).size;
  const concentrationAlert = topPosition && (getValue(topPosition) / totalValue) > 0.2;
  const coverage = markToMarket && markToMarket.totalPositions > 0
    ? (markToMarket.coveredPositions / markToMarket.totalPositions) * 100
    : 0;
  const concentrationPct = topPosition ? (getValue(topPosition) / Math.max(1, totalValue)) * 100 : 0;
  const patrimonioTotal = markToMarket?.liveTotalValue && markToMarket.liveTotalValue > 0
    ? markToMarket.liveTotalValue
    : summary.totalInvested;
  const rentMes = markToMarket?.pnlPercentage ?? 0;
  const proventosPendentes = totalValue * 0.0018;
  const irDevido = Math.max((markToMarket?.pnlValue ?? 0) * 0.15, 0);
  const liquidezD0 = positions
    .filter((p) => ['POUPANCA', 'RENDA_FIXA'].includes((p.assetClass ?? p.classe) || ''))
    .reduce((sum, p) => sum + getValue(p), 0);

  const lastImportFormatted = summary.lastImportDate 
    ? new Date(summary.lastImportDate).toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      })
    : 'não disponível';

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold text-sky-400 mb-4">Visão geral da carteira</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Patrimônio Total"
          value={formatCurrency(patrimonioTotal)}
          subtitle="Marcação a mercado"
          icon={Wallet}
          trend={rentMes >= 0 ? 'up' : 'down'}
          trendLabel={`${rentMes >= 0 ? '+' : ''}${formatPercent(rentMes)}`}
          sparkline={[95, 100, 105, 101, 108, 112]}
        />
        <KpiCard
          label="Rentabilidade Mês"
          value={`${rentMes >= 0 ? '+' : ''}${formatPercent(rentMes)}`}
          subtitle="vs CDI +0.90%"
          icon={TrendingUp}
          trend={rentMes >= 0 ? 'up' : 'down'}
          sparkline={[0.5, 1.2, 0.9, 1.4, 1.6, rentMes]}
        />
        <KpiCard
          label="Nº Posições"
          value={summary.totalPositions}
          subtitle={`${summary.uniqueTickers} ativos únicos`}
          icon={PieChart}
          trend="neutral"
          sparkline={[20, 23, 28, 31, 37, summary.totalPositions]}
        />
        <KpiCard
          label="Concentração Máx"
          value={`${topPosition?.ticker ?? 'N/A'} ${formatPercent(concentrationPct)}`}
          subtitle="posição líder"
          icon={BarChart3}
          trend={concentrationPct > 20 ? 'down' : 'neutral'}
          alert={concentrationPct > 20}
          sparkline={[18, 16, 14, 12, 13, concentrationPct]}
        />
        <KpiCard
          label="Proventos Pendentes"
          value={formatCurrency(proventosPendentes)}
          subtitle="estimativa do ciclo atual"
          icon={Coins}
          trend="up"
          sparkline={[700, 840, 920, 1010, 1130, proventosPendentes]}
        />
        <KpiCard
          label="IR Devido"
          value={formatCurrency(irDevido)}
          subtitle="estimado sobre P/L" 
          icon={CircleDollarSign}
          trend={irDevido > 0 ? 'down' : 'neutral'}
          alert={irDevido > 0}
          sparkline={[0, 120, 180, 220, 260, irDevido]}
        />
        <KpiCard
          label="Liquidez D+0"
          value={formatCurrency(liquidezD0)}
          subtitle={`Cobertura BRAPI: ${formatPercent(coverage)}`}
          icon={Landmark}
          trend="neutral"
          sparkline={[180000, 210000, 260000, 300000, 360000, liquidezD0]}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300 mb-2">Diversificação por classes</p>
          <div className="h-2 w-full rounded-full bg-slate-700/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-teal-500" style={{ width: `${Math.min(diversification * 8, 100)}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-300">{diversification} classes com alocação ativa</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300 mb-2">Última importação</p>
          <p className="text-lg font-semibold text-white">{lastImportFormatted}</p>
          <p className="mt-2 text-sm text-slate-300">{summary.uniqueInstitutions} instituições monitoradas</p>
        </div>
      </div>

      {concentrationAlert && (
        <div className="rounded-xl border border-red-500 bg-red-900/20 p-4 shadow-lg col-span-full mt-4">
          <p className="text-sm text-red-400 font-semibold">Alerta: Concentração Alta</p>
          <p className="text-white">Uma posição representa mais de 20% da carteira.</p>
        </div>
      )}
    </section>
  );
}
