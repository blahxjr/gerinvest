import { PortfolioSummary } from '@/core/domain/portfolio';
import { Position } from '@/core/domain/position';
import { ASSET_CLASS_LABELS } from '@/core/domain/types';

type Props = { 
  summary: PortfolioSummary & { lastImportDate?: string };
  positions: Position[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatPercent = (value: number, decimals = 2) =>
  `${value.toFixed(decimals)}%`;

export default function PortfolioOverview({ summary, positions }: Props) {
  const getValue = (p: any) => p.valorAtualBrl ?? p.grossValue ?? 0;
  const totalValue = positions.reduce((sum, p) => sum + getValue(p), 0);
  const topPosition = positions.reduce((top, p) => getValue(p) > getValue(top) ? p : top, positions[0]);
  const diversification = new Set(positions.map(p => p.assetClass || p.classe)).size;
  const concentrationAlert = topPosition && (getValue(topPosition) / totalValue) > 0.2;

  const lastImportFormatted = summary.lastImportDate 
    ? new Date(summary.lastImportDate).toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      })
    : 'não disponível';

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold text-sky-400 mb-4">Visão geral da carteira</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <p className="text-sm text-slate-400">Patrimônio Total</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalInvested)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <p className="text-sm text-slate-400">Ativos (ticker)</p>
          <p className="text-2xl font-bold text-white">{summary.uniqueTickers}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <p className="text-sm text-slate-400">Instituições</p>
          <p className="text-2xl font-bold text-white">{summary.uniqueInstitutions}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <p className="text-sm text-slate-400">Diversificação (classes)</p>
          <p className="text-2xl font-bold text-white">{diversification}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <p className="text-sm text-slate-400">Maior Posição</p>
          <p className="text-lg font-bold text-white">{topPosition?.ticker} ({formatPercent((topPosition?.grossValue || 0) / totalValue * 100)})</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <p className="text-sm text-slate-400">Última Importação</p>
          <p className="text-lg font-bold text-white">{lastImportFormatted}</p>
        </div>
        {concentrationAlert && (
          <div className="rounded-xl border border-red-500 bg-red-900/20 p-4 shadow-lg col-span-full">
            <p className="text-sm text-red-400 font-semibold">Alerta: Concentração Alta</p>
            <p className="text-white">Uma posição representa mais de 20% da carteira.</p>
          </div>
        )}
      </div>
    </section>
  );
}
