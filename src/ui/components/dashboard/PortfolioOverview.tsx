import { PortfolioSummary } from '@/core/domain/portfolio';

type Props = { summary: PortfolioSummary & { lastImportDate?: string } };

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function PortfolioOverview({ summary }: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold text-sky-400 mb-4">Visão geral da carteira</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>
      <p className="mt-3 text-sm text-slate-400">
        Última importação: {summary.lastImportDate ?? 'não disponível'}
      </p>
    </section>
  );
}
